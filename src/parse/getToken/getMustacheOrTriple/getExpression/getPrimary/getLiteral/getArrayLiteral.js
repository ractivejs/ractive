define([
	'config/types',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/shared/getExpressionList'
], function (
	types,
	allowWhitespace,
	getStringMatch,
	getExpressionList
) {
	
	'use strict';

	return function ( tokenizer ) {
		var start, expressionList;

		start = tokenizer.pos;

		// allow whitespace before '['
		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, '[' ) ) {
			tokenizer.pos = start;
			return null;
		}

		expressionList = getExpressionList( tokenizer );

		if ( !getStringMatch( tokenizer, ']' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			t: types.ARRAY_LITERAL,
			m: expressionList
		};
	};

});