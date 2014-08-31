define(function () {

	'use strict';
	
	return function arrayContains ( array, value ) {
		for ( var i = 0, c = array.length; i < c; i++ ) {
			if ( array[i] == value ) {
				return true;
			}
		}
	
	    return false;
	};

});