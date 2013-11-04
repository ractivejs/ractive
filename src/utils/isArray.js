define( function () {
	
	'use strict';

	var toString = Object.prototype.toString;

	// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
	return function ( thing ) {
		return toString.call( thing ) === '[object Array]';
	};

});