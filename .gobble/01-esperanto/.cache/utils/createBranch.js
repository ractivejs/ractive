define(function () {

	'use strict';
	
	var numeric = /^\s*[0-9]+\s*$/;
	
	return function ( key ) {
		return numeric.test( key ) ? [] : {};
	};

});