define( function () {

	'use strict';

	var toString = Object.prototype.toString;

	return function ( thing ) {
		return ( thing && toString.call( thing ) === '[object Object]' );
	};

});
