define( function () {

	'use strict';

	if ( typeof window !== 'undefined' && window.performance && typeof window.performance.now === 'function' ) {
		return function () {
			return window.performance.now();
		};
	} else {
		return function () {
			return Date.now();
		};
	}

});
