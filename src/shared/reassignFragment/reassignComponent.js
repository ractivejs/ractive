define([
	'utils/hasOwnProperty',
	'shared/reassignFragment/utils/getNewKeypath'
], function (
	hasOwnProperty,
	getNewKeypath
) {

	'use strict';

	return function reassignComponent ( component, indexRef, newIndex, oldKeypath, newKeypath ) {
		var childInstance = component.instance, parentInstance = childInstance._parent, indexRefAlias;

		component.bindings.forEach( function ( binding ) {
			var updated;

			if ( binding.root !== parentInstance ) {
				return; // we only want parent -> child bindings for this
			}

			if ( binding.keypath === indexRef ) {
				childInstance.set( binding.otherKeypath, newIndex );
			}

			if ( updated = getNewKeypath( binding.keypath, oldKeypath, newKeypath ) ) {
				binding.reassign( updated );
			}
		});

		if ( indexRefAlias = component.indexRefBindings[ indexRef ] ) {
			childInstance.set( indexRefAlias, newIndex );
		}
	};

});
