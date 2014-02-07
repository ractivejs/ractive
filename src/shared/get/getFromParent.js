define([
	'state/failedLookups',
	'shared/createComponentBinding',
	'shared/get/FAILED_PARENT_LOOKUP'
], function (
	failedLookups,
	createComponentBinding,
	FAILED_PARENT_LOOKUP
) {

	'use strict';

	return function getFromParent ( child, keypath ) {
		var parent, contextStack, keypathToTest, value, i;

		parent = child._parent;
		if ( !parent ) {
			return;
		}

		if ( failedLookups( child._guid + keypath ) ) {
			return FAILED_PARENT_LOOKUP;
		}

		contextStack = child.component.parentFragment.contextStack;
		i = contextStack.length;
		while ( i-- ) {
			keypathToTest = contextStack[i] + '.' + keypath;
			value = parent.get( keypathToTest );

			if ( value !== undefined ) {
				createComponentBinding( child.component, parent, keypathToTest, keypath );
				child._cache[ keypath ] = value;
				return value;
			}
		}

		value = parent.get( keypath );
		if ( value !== undefined ) {
			createComponentBinding( child.component, parent, keypath, keypath );
			child._cache[ keypath ] = value;
			return value;
		}

		// Short-circuit this process next time
		failedLookups.add( child._guid + keypath );
		return FAILED_PARENT_LOOKUP;
	};

});
