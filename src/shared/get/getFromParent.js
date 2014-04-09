define([
	'circular',
	'shared/createComponentBinding',
	'shared/set'
], function (
	circular,
	createComponentBinding,
	set
) {

	'use strict';

	var get;

	circular.push( function () {
		get = circular.get;
	});

	return function getFromParent ( child, keypath ) {
		var parent, fragment, keypathToTest, value, index;

		parent = child._parent;

		fragment = child.component.parentFragment;

		// Special case - index refs
		if ( fragment.indexRefs && ( index = fragment.indexRefs[ keypath ] ) !== undefined ) {
			// create an index ref binding, so that it can be reassigned letter if necessary
			child.component.indexRefBindings[ keypath ] = keypath;
			return index;
		}

		do {
			if ( !fragment.context ) {
				continue;
			}

			keypathToTest = fragment.context + '.' + keypath;
			value = get( parent, keypathToTest );

			if ( value !== undefined ) {
				createLateComponentBinding( parent, child, keypathToTest, keypath, value );
				return value;
			}
		} while ( fragment = fragment.parent );

		value = get( parent, keypath );
		if ( value !== undefined ) {
			createLateComponentBinding( parent, child, keypath, keypath, value );
			return value;
		}
	};

	function createLateComponentBinding ( parent, child, parentKeypath, childKeypath, value ) {
		set( child, childKeypath, value, true );
		createComponentBinding( child.component, parent, parentKeypath, childKeypath );
	}

});
