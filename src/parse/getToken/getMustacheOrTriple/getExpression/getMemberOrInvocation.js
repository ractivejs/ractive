define([
	'config/types',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/getMustacheOrTriple/getExpression/getPrimary/_index',
	'parse/getToken/getMustacheOrTriple/getExpression/shared/getExpressionList',
	'parse/getToken/getMustacheOrTriple/getExpression/shared/getRefinement'
], function (
	types,
	allowWhitespace,
	getStringMatch,
	getPrimary,
	getExpressionList,
	getRefinement
) {
	
	'use strict';

	var getExpression;

	loadCircularDependency( function () {
		require([ 'parse/getToken/getMustacheOrTriple/getExpression/_index' ], function ( dep ) {
			getExpression = dep;
		});
	});

	
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

			else if ( getStringMatch( tokenizer, '(' ) ) {
				allowWhitespace( tokenizer );
				expressionList = getExpressionList( tokenizer );

				allowWhitespace( tokenizer );

				if ( !getStringMatch( tokenizer, ')' ) ) {
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