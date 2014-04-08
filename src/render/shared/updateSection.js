define([
	'utils/isArray',
	'utils/isObject'
], function (
	isArray,
	isObject
) {

	'use strict';

	return function updateSection ( section, value ) {
		var fragmentOptions = {
			descriptor: section.descriptor.f,
			root:       section.root,
			pNode:      section.parentFragment.pNode,
			pElement:   section.parentFragment.pElement,
			owner:      section
		};

		// if section is inverted, only check for truthiness/falsiness
		if ( section.descriptor.n ) {
			updateConditionalSection( section, value, true, fragmentOptions );
			return;
		}

		// otherwise we need to work out what sort of section we're dealing with

		// if value is an array, or an object with an index reference, iterate through
		if ( isArray( value ) ) {
			updateListSection( section, value, fragmentOptions );
		}


		// if value is a hash...
		else if ( isObject( value ) || typeof value === 'function' ) {
			if ( section.descriptor.i ) {
				updateListObjectSection( section, value, fragmentOptions );
			} else {
				updateContextSection( section, fragmentOptions );
			}
		}


		// otherwise render if value is truthy, unrender if falsy
		else {
			updateConditionalSection( section, value, false, fragmentOptions );
		}
	};

	function updateListSection ( section, value, fragmentOptions ) {
		var i, length, fragmentsToRemove;

		length = value.length;

		// if the array is shorter than it was previously, remove items
		if ( length < section.length ) {
			fragmentsToRemove = section.fragments.splice( length, section.length - length );

			while ( fragmentsToRemove.length ) {
				fragmentsToRemove.pop().teardown( true );
			}
		}

		// otherwise...
		else {

			if ( length > section.length ) {
				// add any new ones
				for ( i=section.length; i<length; i+=1 ) {
					// append list item to context stack
					fragmentOptions.context = section.keypath + '.' + i;
					fragmentOptions.index = i;

					if ( section.descriptor.i ) {
						fragmentOptions.indexRef = section.descriptor.i;
					}

					section.fragments[i] = section.createFragment( fragmentOptions );
				}
			}
		}

		section.length = length;
	}

	function updateListObjectSection ( section, value, fragmentOptions ) {
		var id, i, hasKey, fragment;

		hasKey = section.hasKey || ( section.hasKey = {} );

		// remove any fragments that should no longer exist
		i = section.fragments.length;
		while ( i-- ) {
			fragment = section.fragments[i];

			if ( !( fragment.index in value ) ) {
				section.fragments[i].teardown( true );
				section.fragments.splice( i, 1 );

				hasKey[ fragment.index ] = false;
			}
		}

		// add any that haven't been created yet
		for ( id in value ) {
			if ( !hasKey[ id ] ) {
				fragmentOptions.context = section.keypath + '.' + id;
				fragmentOptions.index = id;

				if ( section.descriptor.i ) {
					fragmentOptions.indexRef = section.descriptor.i;
				}

				section.fragments.push( section.createFragment( fragmentOptions ) );
				hasKey[ id ] = true;
			}
		}

		section.length = section.fragments.length;
	}

	function updateContextSection ( section, fragmentOptions ) {
		// ...then if it isn't rendered, render it, adding section.keypath to the context stack
		// (if it is already rendered, then any children dependent on the context stack
		// will update themselves without any prompting)
		if ( !section.length ) {
			// append this section to the context stack
			fragmentOptions.context = section.keypath;
			fragmentOptions.index = 0;

			section.fragments[0] = section.createFragment( fragmentOptions );
			section.length = 1;
		}
	}

	function updateConditionalSection ( section, value, inverted, fragmentOptions ) {
		var doRender, emptyArray, fragmentsToRemove, fragment;

		emptyArray = ( isArray( value ) && value.length === 0 );

		if ( inverted ) {
			doRender = emptyArray || !value;
		} else {
			doRender = value && !emptyArray;
		}

		if ( doRender ) {
			if ( !section.length ) {
				// no change to context stack
				fragmentOptions.index = 0;

				section.fragments[0] = section.createFragment( fragmentOptions );
				section.length = 1;
			}

			if ( section.length > 1 ) {
				fragmentsToRemove = section.fragments.splice( 1 );

				while ( fragment = fragmentsToRemove.pop() ) {
					fragment.teardown( true );
				}
			}
		}

		else if ( section.length ) {
			section.teardownFragments( true );
			section.length = 0;
		}
	}

});
