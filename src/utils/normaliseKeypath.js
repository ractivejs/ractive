define( function () {

	'use strict';

	var regex = /\[\s*(\*|[0-9]|[1-9][0-9]+)\s*\]/g;

	return function ( keypath ) {
		return ( keypath || '' ).replace( regex, '.$1' );
	};

});
