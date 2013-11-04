/* global console */
define( function () {
	
	'use strict';

	if ( typeof console !== undefined && console.warn ) {
		return function () {
			console.warn.apply( console, arguments );
		};
	}

	return function () {};

});