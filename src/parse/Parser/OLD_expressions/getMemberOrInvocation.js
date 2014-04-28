define([
	'config/types',
	'parse/Tokenizer/getExpression/getPrimary/_getPrimary',
	'parse/Tokenizer/getExpression/shared/getExpressionList',
	'parse/Tokenizer/getExpression/shared/getRefinement'
], function (
	types,
	getPrimary,
	getExpressionList,
	getRefinement
) {

	'use strict';

	return function ( tokenizer ) {
		var current, expression, refinement, expressionList;

		expression = getPrimary( tokenizer );

		if ( !expression ) {
			return null;
		}

		while ( expression ) {
			current = tokenizer.pos;

			if ( refinement = getRefinement( tokenizer ) ) {
				expression = {
					t: types.MEMBER,
					x: expression,
					r: refinement
				};
			}

			else if ( tokenizer.matchString( '(' ) ) {
				tokenizer.allowWhitespace();
				expressionList = getExpressionList( tokenizer );

				tokenizer.allowWhitespace();

				if ( !tokenizer.matchString( ')' ) ) {
					tokenizer.pos = current;
					break;
				}

				expression = {
					t: types.INVOCATION,
					x: expression
				};

				if ( expressionList ) {
					expression.o = expressionList;
				}
			}

			else {
				break;
			}
		}

		return expression;
	};

});
