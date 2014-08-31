define(['virtualdom/items/shared/utils/startsWithKeypath'],function (startsWithKeypath) {

	'use strict';
	
	return function getNewKeypath( targetKeypath, oldKeypath, newKeypath ) {
		// exact match
		if ( targetKeypath === oldKeypath ) {
			return newKeypath !== undefined ? newKeypath : null;
		}
	
		// partial match based on leading keypath segments
		if ( startsWithKeypath( targetKeypath, oldKeypath ) ){
			return newKeypath === null ? newKeypath : targetKeypath.replace( oldKeypath + '.', newKeypath + '.' );
		}
	};

});