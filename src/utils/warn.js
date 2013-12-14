/* global console */
define( function () {
	
	'use strict';

	if ( typeof console !== undefined && typeof console.warn === 'function' && typeof console.warn.apply === 'function' ) {
		return function () {
			console.warn.apply( console, arguments );
		};
	}

	return function () {};

});