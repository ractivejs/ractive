define( function () {
	
	'use strict';

	var pattern = /\[\s*([0-9]|[1-9][0-9]+)\s*\]/g;

	return function ( keypath ) {
		return keypath.replace( pattern, '.$1' );
	};

});