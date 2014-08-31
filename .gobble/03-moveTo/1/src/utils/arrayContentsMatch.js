define(['utils/isArray'],function (isArray) {

	'use strict';
	
	return function ( a, b ) {
		var i;
	
		if ( !isArray( a ) || !isArray( b ) ) {
			return false;
		}
	
		if ( a.length !== b.length ) {
			return false;
		}
	
		i = a.length;
		while ( i-- ) {
			if ( a[i] !== b[i] ) {
				return false;
			}
		}
	
		return true;
	};

});