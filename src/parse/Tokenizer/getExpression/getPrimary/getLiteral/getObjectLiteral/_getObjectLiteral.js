define([
	'config/types',
	'parse/Tokenizer/getExpression/getPrimary/getLiteral/getObjectLiteral/getKeyValuePairs'
], function (
	types,
	getKeyValuePairs
) {

	'use strict';

	return function ( tokenizer ) {
		var start, keyValuePairs;

		start = tokenizer.pos;

		// allow whitespace
		tokenizer.allowWhitespace();

		if ( !tokenizer.getStringMatch( '{' ) ) {
			tokenizer.pos = start;
			return null;
		}

		keyValuePairs = getKeyValuePairs( tokenizer );

		// allow whitespace between final value and '}'
		tokenizer.allowWhitespace();

		if ( !tokenizer.getStringMatch( '}' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			t: types.OBJECT_LITERAL,
			m: keyValuePairs
		};
	};

});
