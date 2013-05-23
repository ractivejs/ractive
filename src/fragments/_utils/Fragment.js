utils.Fragment = function ( options ) {

	var numItems, i, itemOptions, parentRefs, ref;

	// The item that owns this fragment - an element, section, partial, or attribute
	this.owner = options.owner;

	// If parent item is a section, this may not be the only fragment
	// that belongs to it - we need to make a note of the index
	if ( this.owner.type === SECTION ) {
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