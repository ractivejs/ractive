define(function () {

	'use strict';
	
	var pattern = /[-/\\^$*+?.()|[\]{}]/g;
	
	return function escapeRegExp ( str ) {
		return str.replace( pattern, '\\$&' );
	};

});