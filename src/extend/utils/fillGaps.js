define( function () {
	
	'use strict';

	return function ( target, source ) {
		var key;

		for ( key in source ) {
			if ( source.hasOwnProperty( key ) && !target.hasOwnProperty( key ) ) {
				target[ key ] = source[ key ];
			}
		}

		return target;
	};

});