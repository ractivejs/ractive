define([
	'config/types',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/getLiteral/getObjectLiteral/getKeyValuePairs'
], function (
	types,
	allowWhitespace,
	getStringMatch,
	getKeyValuePairs
) {
	
	'use strict';

	return function ( tokenizer ) {
		var start, keyValuePairs;

		start = tokenizer.pos;

		// allow whitespace
		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, '{' ) ) {
			tokenizer.pos = start;
			return null;
		}

		keyValuePairs = getKeyValuePairs( tokenizer );

		// allow whitespace between final value and '}'
		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, '}' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			t: types.OBJECT_LITERAL,
			m: keyValuePairs
		};
	};

});