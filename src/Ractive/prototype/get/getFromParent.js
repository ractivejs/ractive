define([
	'shared/createComponentBinding'
], function (
	createComponentBinding
) {

	'use strict';

	return function ( child, keypath ) {
		var parent, contextStack, keypathToTest, value, i;

		parent = child._parent;
		if ( !parent ) {
			return;
		}

		contextStack = child.component.parentFragment.contextStack;
		i = contextStack.length;
		while ( i-- ) {
			keypathToTest = contextStack[i] + '.' + keypath;
			value = parent.get( keypathToTest );

			if ( value !== undefined ) {
				createComponentBinding( child.component, parent, keypathToTest, keypath );
				return value;
			}
		}

		value = parent.get( keypath );
		if ( value !== undefined ) {
			createComponentBinding( child.component, parent, keypath, keypath );
			return value;
		}
	};

});
