(function ( A ) {

	'use strict';

	var isArray, isObject;

	// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
	isArray = function ( obj ) {
		return Object.prototype.toString.call( obj ) === '[object Array]';
	};

	isObject = function ( obj ) {
		return ( Object.prototype.toString.call( obj ) === '[object Object]' ) && ( typeof obj !== 'function' );
	};

	A._Mustache = function ( options ) {

		this.root           = options.root;
		this.model          = options.model;
		this.viewmodel      = options.root.viewmodel;
		this.parent         = options.parent;
		this.parentFragment = options.parentFragment;
		this.contextStack   = options.contextStack || [];
		this.index          = options.index || 0;

		// DOM only
		if ( options.parentNode || options.anchor ) {
			this.parentNode = options.parentNode;
			this.anchor = options.anchor;
		}

		this.type = options.model.type;

		if ( this.initialize ) {
			this.initialize();
		}

		this.viewmodel.registerView( this );

		// if we have a failed keypath lookup, and this is an inverted section,
		// we need to trigger this.update() so the contents are rendered
		if ( !this.keypath && this.model.inv ) { // test both section-hood and inverticity in one go
			this.update( false );
		}

	};


	A._Fragment = function ( options ) {

		var numItems, i, itemOptions, parentRefs, ref;

		if ( this.preInit ) {
			if ( this.preInit( options ) ) {
				return;
			}
		}

		this.parent = options.parent;
		this.index = options.index;
		this.items = [];

		this.indexRefs = {};
		if ( this.parent && this.parent.parentFragment ) {
			parentRefs = this.parent.parentFragment.indexRefs;
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
			parent: this,
			parentNode:     options.parentNode,
			contextStack: options.contextStack
		};

		numItems = ( options.model ? options.model.length : 0 );
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.model = options.model[i];
			itemOptions.index = i;
			// this.items[ this.items.length ] = createView( itemOptions );

			this.items[ this.items.length ] = this.createItem( itemOptions );
		}

	};


	A._sectionUpdate = function ( value ) {
		var fragmentOptions, valueIsArray, emptyArray, i, itemsToRemove;

		fragmentOptions = {
			model: this.model.frag,
			root: this.root,
			parentNode: this.parentNode,
			parent: this
		};

		// TODO if DOM type, need to know anchor
		if ( this.parentNode ) {
			fragmentOptions.anchor = this.parentFragment.findNextNode( this );
		}

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
					// no change to context stack in this situation
					fragmentOptions.contextStack = this.contextStack;
					fragmentOptions.index = 0;

					this.fragments[0] = this.createFragment( fragmentOptions );
					this.length = 1;
					return;
				}
			}

			if ( this.postUpdate ) {
				this.postUpdate();
			}

			return;
		}


		// otherwise we need to work out what sort of section we're dealing with

		// if value is an array, iterate through
		if ( valueIsArray ) {

			// if the array is shorter than it was previously, remove items
			if ( value.length < this.length ) {
				itemsToRemove = this.views.splice( value.length, this.length - value.length );

				while ( itemsToRemove.length ) {
					itemsToRemove.pop().teardown();
				}
			}

			// otherwise...
			else {

				if ( value.length > this.length ) {
					// add any new ones
					for ( i=this.length; i<value.length; i+=1 ) {
						// append list item to context stack
						fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
						fragmentOptions.index = i;

						if ( this.model.i ) {
							fragmentOptions.indexRef = this.model.i;
						}

						this.fragments[i] = this.createFragment( fragmentOptions );
					}
				}
			}

			this.length = value.length;
		}


		// if value is a hash...
		else if ( isObject( value ) ) {
			// ...then if it isn't rendered, render it, adding this.keypath to the context stack
			// (if it is already rendered, then any children dependent on the context stack
			// will update themselves without any prompting)
			if ( !this.length ) {
				// append this section to the context stack
				fragmentOptions.contextStack = this.contextStack.concat( this.keypath );
				fragmentOptions.index = 0;

				this.fragments[0] = this.createFragment( fragmentOptions );
				this.length = 1;
			}
		}


		// otherwise render if value is truthy, unrender if falsy
		else {

			if ( value && !emptyArray ) {
				if ( !this.length ) {
					// no change to context stack
					fragmentOptions.contextStack = this.contextStack;
					fragmentOptions.index = 0;

					this.fragments[0] = this.createFragment( fragmentOptions );
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


		if ( this.postUpdate ) {
			this.postUpdate();
		}


	};




}( Anglebars ));