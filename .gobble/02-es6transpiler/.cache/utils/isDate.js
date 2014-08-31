define(function () {

	'use strict';
	
	var toString = Object.prototype.toString;
	
	return function ( thing ) {
		return toString.call( thing ) === '[object Date]';
	};

});