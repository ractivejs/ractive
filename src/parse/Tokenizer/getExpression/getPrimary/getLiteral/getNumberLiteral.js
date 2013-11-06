define([
	'config/types',
	'parse/Tokenizer/utils/makeRegexMatcher'
], function (
	types,
	makeRegexMatcher
) {
	
	'use strict';

	var getExponent = makeRegexMatcher( /^[eE][\-+]?[0-9]+/ ),
		getFraction = makeRegexMatcher( /^\.[0-9]+/ ),
		getInteger = makeRegexMatcher( /^(0|[1-9][0-9]*)/ );

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