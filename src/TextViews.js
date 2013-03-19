(function ( A ) {

	'use strict';

	var textViewMustache, TextViews, types, ctors, isArray, isObject;

	types = A.types;

	ctors = [];
	ctors[ types.TEXT ] = 'Text';
	ctors[ types.INTERPOLATOR ] = 'Interpolator';
	ctors[ types.TRIPLE ] = 'Triple';
	ctors[ types.SECTION ] = 'Section';

	isArray = A.isArray;
	isObject = A.isObject;

	// Substring constructor factory
	textViewMustache = function ( proto ) {
		var Mustache;

		Mustache = function ( options ) {

			this.model = options.model;
			this.anglebars = options.anglebars;
			this.viewmodel = options.anglebars.viewmodel;
			this.parent = options.parent;
			this.contextStack = options.contextStack || [];

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

		Mustache.prototype = proto;

		return Mustache;
	};


	// Substring types
	TextViews = A.TextViews = {
		create: function ( options ) {
			if ( typeof options.model === 'string' ) {
				return new TextViews.Text( options.model );
			}

			return new TextViews[ ctors[ options.model.type ] ]( options );
		}
	};



	// Fragment
	TextViews.Fragment = function ( options ) {
		var numItems, i, itemOptions, parentRefs, ref;

		this.parent = options.parent;
		this.items = [];

		this.indexRefs = {};
		if ( this.owner ) {
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
			anglebars:    options.anglebars,
			parent:       this,
			contextStack: options.contextStack
		};

		numItems = ( options.models ? options.models.length : 0 );
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.model = this.models[i];
			this.items[ this.items.length ] = TextViews.create( itemOptions );
		}

		this.value = this.items.join('');
	};

	TextViews.Fragment.prototype = {
		bubble: function () {
			this.value = this.items.join( '' );
			this.parent.bubble();
		},

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};



	// Plain text
	TextViews.Text = function ( text ) {
		this.text = text;
	};

	TextViews.Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Mustaches

	// Interpolator or Triple
	TextViews.Interpolator = textViewMustache({
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		bubble: function () {
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
	});

	// Triples are the same as Interpolators in this context
	TextViews.Triple = TextViews.Interpolator;


	// Section
	TextViews.Section = textViewMustache({
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
			var emptyArray, i, childrenToRemove, valueIsArray;

			valueIsArray = isArray( value );

			// modify the array to allow updates via push, pop etc
			if ( this.anglebars.modifyArrays ) {
				A.modifyArray( value, this.keypath, this.anglebars.viewmodel );
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
						this.children[0] = new TextViews.Fragment( this.model.frag, this.anglebars, this, this.contextStack );
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
								this.children[i] = new TextViews.Fragment( this.model.frag, this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
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
						this.children[0] = new TextViews.Fragment( this.model.frag, this.anglebars, this, this.contextStack.concat( this.keypath ) );
						this.length = 1;
					}
				}
			}

			// otherwise render if value is truthy, unrender if falsy
			else {

				if ( value && !emptyArray ) {
					if ( !this.length ) {
						this.children[0] = new TextViews.Fragment( this.model.frag, this.anglebars, this, this.contextStack );
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
	});

}( Anglebars ));