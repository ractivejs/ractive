define( function () {

	'use strict';

	var toString = Object.prototype.toString;

	return function ( thing ) {
		return ( typeof thing === 'object' && toString.call( thing ) === '[object Object]' );
	};

});