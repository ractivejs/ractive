define( function () {
	
	'use strict';

	return function ( source ) {
		var target = {}, key;

		for ( key in source ) {
			if ( source.hasOwnProperty( key ) ) {
				target[ key ] = source[ key ];
			}
		}

		return target;
	};

});