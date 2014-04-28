define([
	'config/types',
	'parse/Tokenizer/getExpression/shared/getExpressionList'
], function (
	types,
	getExpressionList
) {

	'use strict';

	return function ( tokenizer ) {
		var start, expressionList;

		start = tokenizer.pos;

		// allow whitespace before '['
		tokenizer.allowWhitespace();

		if ( !tokenizer.matchString( '[' ) ) {
			tokenizer.pos = start;
			return null;
		}

		expressionList = getExpressionList( tokenizer );

		if ( !tokenizer.matchString( ']' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			t: types.ARRAY_LITERAL,
			m: expressionList
		};
	};

});
