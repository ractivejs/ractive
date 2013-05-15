(function ( _internal ) {

	'use strict';

	_internal.Mustache = function ( options ) {

		this.root           = options.root;
		this.descriptor     = options.descriptor;
		this.parentFragment = options.parentFragment;
		this.contextStack   = options.contextStack || [];
		this.index          = options.index || 0;

		// DOM only
		if ( options.parentNode || options.anchor ) {
			this.parentNode = options.parentNode;
			this.anchor = options.anchor;
		}

		this.type = options.descriptor.t;

		this.root._registerMustache( this );

		// if we have a failed keypath lookup, and this is an inverted section,
		// we need to trigger this.update() so the contents are rendered
		if ( !this.keypath && this.descriptor.n ) { // test both section-hood and inverticity in one go
			this.update( this.descriptor.m ? this.root._modify( false, this.descriptor.m ) : false );
		}

	};


	_internal.Fragment = function ( options ) {

		var numItems, i, itemOptions, parentRefs, ref;

		// The item that owns this fragment - an element, section, partial, or attribute
		this.owner = options.owner;

		// If parent item is a section, this may not be the only fragment
		// that belongs to it - we need to make a note of the index
		if ( this.owner.type === _internal.types.SECTION ) {
			this.index = options.index;
		}

		// index references (the 'i' in {{#section:i}}<!-- -->{{/section}}) need to cascade
		// down the tree
		if ( this.owner.parentFragment ) {
			parentRefs = this.owner.parentFragment.indexRefs;

			if ( parentRefs ) {
				this.indexRefs = {};

				for ( ref in parentRefs ) {
					if ( parentRefs.hasOwnProperty( ref ) ) {
						this.indexRefs[ ref ] = parentRefs[ ref ];
					}
				}
			}
		}

		if ( options.indexRef ) {
			if ( !this.indexRefs ) {
				this.indexRefs = {};
			}

			this.indexRefs[ options.indexRef ] = options.index;
		}

		// Time to create this fragment's child items;
		this.items = [];

		itemOptions = {
			root:           options.root,
			parentFragment: this,
			parentNode:     options.parentNode,
			contextStack:   options.contextStack
		};

		numItems = ( options.descriptor ? options.descriptor.length : 0 );
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.descriptor = options.descriptor[i];
			itemOptions.index = i;

			this.items[ this.items.length ] = this.createItem( itemOptions );
		}

	};


	_internal.sectionUpdate = function ( value ) {
		var fragmentOptions, valueIsArray, emptyArray, i, itemsToRemove;

		fragmentOptions = {
			descriptor: this.descriptor.f,
			root:       this.root,
			parentNode: this.parentNode,
			owner:      this
		};

		// TODO if DOM type, need to know anchor
		if ( this.parentNode ) {
			fragmentOptions.anchor = this.parentFragment.findNextNode( this );
		}

		valueIsArray = _internal.isArray( value );

		// treat empty arrays as false values
		if ( valueIsArray && value.length === 0 ) {
			emptyArray = true;
		}



		// if section is inverted, only check for truthiness/falsiness
		if ( this.descriptor.n ) {
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

			return;
		}


		// otherwise we need to work out what sort of section we're dealing with

		// if value is an array, iterate through
		if ( valueIsArray ) {

			// if the array is shorter than it was previously, remove items
			if ( value.length < this.length ) {
				itemsToRemove = this.fragments.splice( value.length, this.length - value.length );

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

						if ( this.descriptor.i ) {
							fragmentOptions.indexRef = this.descriptor.i;
						}

						this.fragments[i] = this.createFragment( fragmentOptions );
					}
				}
			}

			this.length = value.length;
		}


		// if value is a hash...
		else if ( _internal.isObject( value ) ) {
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
	};


}( _internal ));