(function ( A ) {

	'use strict';

	var createView, types, isArray, isObject,
		Text, Mustache, Interpolator, Triple, Section;

	types = A.types;

	isArray = A.isArray;
	isObject = A.isObject;

	// Base Mustache class
	Mustache = function ( options ) {

		this.model          = options.model;
		this.root           = options.root;
		this.viewmodel      = options.root.viewmodel;
		this.parent         = options.parent;
		this.parentFragment = options.parentFragment;
		this.contextStack   = options.contextStack || [];

		this.type = options.model.type;

		// If there is an init method, call it
		if ( this.initialize ) {
			this.initialize();
		}

		this.viewmodel.registerView( this );

		// If we have a failed keypath lookup, and this is an inverted section,
		// we need to trigger this.update() so the contents are rendered
		if ( !this.keypath && this.model.inv ) { // Test both section-hood and inverticity in one go
			this.update( false );
		}
	};


	// Substring types
	createView = function ( options ) {
		if ( typeof options.model === 'string' ) {
			return new Text( options.model );
		}

		switch ( options.model.type ) {
			case types.INTERPOLATOR: return new Interpolator( options );
			case types.TRIPLE: return new Triple( options );
			case types.SECTION: return new Section( options );

			default: throw 'Something went wrong in a rather interesting way';
		}
	};



	// Fragment
	A.TextFragment = function ( options ) {
		var numItems, i, itemOptions, parentRefs, ref;

		this.owner = options.owner;
		this.index = options.index;
		this.items = [];

		this.indexRefs = {};
		if ( this.owner && this.owner.parentFragment ) {
			parentRefs = this.owner.parentFragment.indexRefs;
			for ( ref in parentRefs ) {
				if ( parentRefs.hasOwnProperty( ref ) ) {
					this.indexRefs[ ref ] = parentRefs[ ref ];
				}
			}
		}

		if ( options.indexRef ) {
			this.indexRefs[ options.indexRef ] = options.index;
		}

		itemOptions = {
			root: options.root,
			parentFragment: this,
			parent: this.owner,
			contextStack: options.contextStack
		};

		numItems = ( options.model ? options.model.length : 0 );
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.model = options.model[i];
			this.items[ this.items.length ] = createView( itemOptions );
		}

		this.value = this.items.join('');
	};

	A.TextFragment.prototype = {
		// bubble: function () {
		// 	this.value = this.items.join( '' );
		// 	this.parent.bubble();
		// },

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		toString: function () {
			// TODO refactor this... value should already have been calculated? or maybe not. Top-level items skip the fragment and bubble straight to the attribute...
			// argh, it's confusing me
			return this.items.join( '' );
		}
	};



	// Plain text
	Text = function ( text ) {
		this.text = text;
	};

	Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Mustaches

	// Interpolator or Triple
	Interpolator = function ( options ) {
		Mustache.call( this, options );
	};

	Interpolator.prototype = {
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};

	// Triples are the same as Interpolators in this context
	Triple = Interpolator;


	// Section
	Section = function ( options ) {
		Mustache.call( this, options );
	};

	Section.prototype = {
		initialize: function () {
			this.children = [];
			this.length = 0;
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		unrender: function () {
			while ( this.children.length ) {
				this.children.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.children.join( '' );
			this.parent.bubble();
		},

		update: function ( value ) {
			var emptyArray, i, childrenToRemove, valueIsArray, fragmentOptions;

			fragmentOptions = {
				model: this.model.frag,
				root:  this.root,
				owner: this
			};

			valueIsArray = isArray( value );

			// modify the array to allow updates via push, pop etc
			if ( valueIsArray && this.root.modifyArrays ) {
				A.modifyArray( value, this.keypath, this.root.viewmodel );
			}

			// treat empty arrays as false values
			if ( valueIsArray && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inv ) {
				if ( value && !emptyArray ) {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
					}
				}

				else {
					if ( !this.length ) {
						fragmentOptions.contextStack = this.contextStack;
						this.children[0] = new A.TextFragment( fragmentOptions );

						this.length = 1;
					}
				}

				this.value = this.children.join( '' );
				this.parent.bubble();

				return;
			}


			// Otherwise we need to work out what sort of section we're dealing with.
			if( typeof value === 'object' ) {



				// if value is an array, iterate through
				if ( valueIsArray ) {

					// if the array is shorter than it was previously, remove items
					if ( value.length < this.length ) {
						childrenToRemove = this.children.splice( value.length, this.length - value.length );

						while ( childrenToRemove.length ) {
							childrenToRemove.shift().teardown();
						}
					}

					// otherwise...
					else {

						// first, update existing views
						for ( i=0; i<this.length; i+=1 ) {
							this.viewmodel.update( this.keypath + '.' + i );
						}

						if ( value.length > this.length ) {

							// then add any new ones
							for ( i=this.length; i<value.length; i+=1 ) {
								fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
								this.children[i] = new A.TextFragment( fragmentOptions );
							}
						}
					}

					this.length = value.length;
				}

				// if value is a hash...
				else {
					// ...then if it isn't rendered, render it, adding this.keypath to the context stack
					// (if it is already rendered, then any children dependent on the context stack
					// will update themselves without any prompting)
					if ( !this.length ) {
						fragmentOptions.contextStack = this.contextStack.concat( this.keypath );
						this.children[0] = new A.TextFragment( fragmentOptions );

						this.length = 1;
					}
				}
			}

			// otherwise render if value is truthy, unrender if falsy
			else {

				if ( value && !emptyArray ) {
					if ( !this.length ) {
						fragmentOptions.contextStack = this.contextStack;
						this.children[0] = new A.TextFragment( fragmentOptions );

						this.length = 1;
					}
				}

				else {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
					}
				}
			}

			this.value = this.children.join( '' );
			this.parent.bubble();
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};

}( Anglebars ));