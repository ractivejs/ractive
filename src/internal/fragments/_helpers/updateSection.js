updateSection = function ( section, value ) {
	var fragmentOptions, valueIsArray, emptyArray, i, itemsToRemove;

	fragmentOptions = {
		descriptor: section.descriptor.f,
		root:       section.root,
		parentNode: section.parentNode,
		owner:      section
	};

	valueIsArray = isArray( value );

	// treat empty arrays as false values
	if ( valueIsArray && value.length === 0 ) {
		emptyArray = true;
	}



	// if section is inverted, only check for truthiness/falsiness
	if ( section.descriptor.n ) {
		if ( value && !emptyArray ) {
			if ( section.length ) {
				section.teardownFragments( true );
				section.length = 0;
			}
		}

		else {
			if ( !section.length ) {
				// no change to context stack in this situation
				fragmentOptions.contextStack = section.contextStack;
				fragmentOptions.index = 0;

				section.fragments[0] = section.createFragment( fragmentOptions );
				section.length = 1;
				return;
			}
		}

		return;
	}


	// otherwise we need to work out what sort of section we're dealing with

	// if value is an array, iterate through
	if ( valueIsArray ) {

		// if the array is shorter than it was previously, remove items
		if ( value.length < section.length ) {
			itemsToRemove = section.fragments.splice( value.length, section.length - value.length );

			while ( itemsToRemove.length ) {
				itemsToRemove.pop().teardown( true );
			}
		}

		// otherwise...
		else {

			if ( value.length > section.length ) {
				// add any new ones
				for ( i=section.length; i<value.length; i+=1 ) {
					// append list item to context stack
					fragmentOptions.contextStack = section.contextStack.concat( section.keypath + '.' + i );
					fragmentOptions.index = i;

					if ( section.descriptor.i ) {
						fragmentOptions.indexRef = section.descriptor.i;
					}

					section.fragments[i] = section.createFragment( fragmentOptions );
				}
			}
		}

		section.length = value.length;
	}


	// if value is a hash...
	else if ( isObject( value ) ) {
		// ...then if it isn't rendered, render it, adding section.keypath to the context stack
		// (if it is already rendered, then any children dependent on the context stack
		// will update themselves without any prompting)
		if ( !section.length ) {
			// append this section to the context stack
			fragmentOptions.contextStack = section.contextStack.concat( section.keypath );
			fragmentOptions.index = 0;

			section.fragments[0] = section.createFragment( fragmentOptions );
			section.length = 1;
		}
	}


	// otherwise render if value is truthy, unrender if falsy
	else {

		if ( value && !emptyArray ) {
			if ( !section.length ) {
				// no change to context stack
				fragmentOptions.contextStack = section.contextStack;
				fragmentOptions.index = 0;

				section.fragments[0] = section.createFragment( fragmentOptions );
				section.length = 1;
			}
		}

		else {
			if ( section.length ) {
				section.teardownFragments( true );
				section.length = 0;
			}
		}
	}
};