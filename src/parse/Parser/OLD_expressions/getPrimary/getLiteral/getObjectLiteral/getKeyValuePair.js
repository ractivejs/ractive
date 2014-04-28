define([
	'config/types',
	'parse/Tokenizer/getExpression/shared/getKey'
], function (
	types,
	getKey
) {

	'use strict';

	return function ( tokenizer ) {
		var start, key, value;

		start = tokenizer.pos;

		// allow whitespace between '{' and key
		tokenizer.allowWhitespace();

		key = getKey( tokenizer );
		if ( key === null ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace between key and ':'
		tokenizer.allowWhitespace();

		// next character must be ':'
		if ( !tokenizer.matchString( ':' ) ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace between ':' and value
		tokenizer.allowWhitespace();

		// next expression must be a, well... expression
		value = tokenizer.getExpression();
		if ( value === null ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			t: types.KEY_VALUE_PAIR,
			k: key,
			v: value
		};
	};

});
