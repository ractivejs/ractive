define([
	'shared/reassignFragment/utils/startsWithKeypath'
], function (
	startsWithKeypath
) {

	'use strict';

	return function getNewKeypath( targetKeypath, oldKeypath, newKeypath ) {

		//exact match
		if( targetKeypath === oldKeypath ) {
			return newKeypath;
		}

		//partial match based on leading keypath segments
		if ( startsWithKeypath(targetKeypath, oldKeypath) ){
			return targetKeypath.replace( oldKeypath + '.', newKeypath + '.' );
		}
	};

});
