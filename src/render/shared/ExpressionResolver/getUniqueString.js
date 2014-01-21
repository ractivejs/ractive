define( function () {

	'use strict';

	return function ( str, args ) {
		// get string that is unique to this expression
		return str.replace( /\$\{([0-9]+)\}/g, function ( match, $1 ) {
			return args[ $1 ] ? args[ $1 ][1] : 'undefined';
		});
	};

});