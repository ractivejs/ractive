utils.sectionUpdate = function ( value ) {
	var fragmentOptions, valueIsArray, emptyArray, i, itemsToRemove;

	fragmentOptions = {
		descriptor: this.descriptor.f,
		root:       this.root,
		parentNode: this.parentNode,
		owner:      this
	};

	valueIsArray = utils.isArray( value );

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
	else if ( utils.isObject( value ) ) {
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