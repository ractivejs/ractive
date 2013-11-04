define([
	'config/types',
	'parse/getToken/utils/getRegexMatcher'
], function (
	types,
	getRegexMatcher
) {
	
	'use strict';

	var getExponent = getRegexMatcher( /^[eE][\-+]?[0-9]+/ ),
		getFraction = getRegexMatcher( /^\.[0-9]+/ ),
		getInteger = getRegexMatcher( /^(0|[1-9][0-9]*)/ );

	return function ( tokenizer ) {
		var start, result;

		start = tokenizer.pos;

		// special case - we may have a decimal without a literal zero (because
		// some programmers are plonkers)
		if ( result = getFraction( tokenizer ) ) {
			return {
				t: types.NUMBER_LITERAL,
				v: result
			};
		}

		result = getInteger( tokenizer );
		if ( result === null ) {
			return null;
		}

		result += getFraction( tokenizer ) || '';
		result += getExponent( tokenizer ) || '';

		return {
			t: types.NUMBER_LITERAL,
			v: result
		};
	};

});