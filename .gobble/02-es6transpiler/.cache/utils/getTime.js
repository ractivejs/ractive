define(function () {

	'use strict';
	
	var getTime;
	
	if ( typeof window !== 'undefined' && window.performance && typeof window.performance.now === 'function' ) {
		getTime = function () {
			return window.performance.now();
		};
	} else {
		getTime = function () {
			return Date.now();
		};
	}
	
	return getTime;

});