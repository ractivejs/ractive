define( function () {

	'use strict';

	var keyPattern = /^(?:(?:[a-zA-Z$_][a-zA-Z$_0-9]*)|(?:[0-9]|[1-9][0-9]+))$/;

	return function ( keypath ) {
		var keys, key, i;

		keys = keypath.split( '.' );

		i = keys.length;
		while ( i-- ) {
			key = keys[i];

			if ( key === 'undefined' || !keyPattern.test( key ) ) {
				return false;
			}
		}

		return true;
	};

});