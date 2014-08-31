define(['config/types'],function (types) {

	'use strict';
	
	var numberPattern = /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/;
	
	return function ( parser ) {
		var result;
	
		if ( result = parser.matchPattern( numberPattern ) ) {
			return {
				t: types.NUMBER_LITERAL,
				v: result
			};
		}
	
		return null;
	};

});