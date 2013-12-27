define([
	'config/types',
	'parse/Tokenizer/utils/makeRegexMatcher'
], function (
	types,
	makeRegexMatcher
) {

	'use strict';

	// bulletproof number regex from https://gist.github.com/Rich-Harris/7544330
	var getNumber = makeRegexMatcher( /^(?:[+-]?)(?:(?:(?:0|[1-9]\d*)?\.\d+)|(?:(?:0|[1-9]\d*)\.)|(?:0|[1-9]\d*))(?:[eE][+-]?\d+)?/ );

	return function ( tokenizer ) {
		var result;

		if ( result = getNumber( tokenizer ) ) {
			return {
				t: types.NUMBER_LITERAL,
				v: result
			};
		}

		return null;
	};

});