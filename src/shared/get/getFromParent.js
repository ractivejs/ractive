define([
	'state/failedLookups',
	'shared/createComponentBinding',
	'Ractive/prototype/shared/replaceData'
], function (
	failedLookups,
	createComponentBinding,
	replaceData
) {

	'use strict';

	return function getFromParent ( child, keypath ) {
		var parent, contextStack, keypathToTest, value, i;

		parent = child._parent;

		if ( failedLookups( child._guid + keypath ) ) {
			return;
		}

		contextStack = child.component.parentFragment.contextStack;
		i = contextStack.length;
		while ( i-- ) {
			keypathToTest = contextStack[i] + '.' + keypath;
			value = parent.get( keypathToTest );

			if ( value !== undefined ) {
				createLateComponentBinding( parent, child, keypathToTest, keypath, value );
				return value;
			}
		}

		value = parent.get( keypath );
		if ( value !== undefined ) {
			createLateComponentBinding( parent, child, keypath, keypath, value );
			return value;
		}

		// Short-circuit this process next time
		failedLookups.add( child._guid + keypath );
	};

	function createLateComponentBinding ( parent, child, parentKeypath, childKeypath, value ) {
		replaceData( child, childKeypath, value );
		child._cache[ childKeypath ] = value;

		createComponentBinding( child.component, parent, parentKeypath, childKeypath );
	}

});
