define(function () {

	'use strict';
	
	// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
	return function ( thing ) {
		return !isNaN( parseFloat( thing ) ) && isFinite( thing );
	};

});