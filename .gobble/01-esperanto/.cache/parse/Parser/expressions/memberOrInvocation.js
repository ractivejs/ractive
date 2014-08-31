define(['config/types','parse/Parser/expressions/primary/_primary','parse/Parser/expressions/shared/expressionList','parse/Parser/expressions/shared/refinement','parse/Parser/expressions/shared/errors'],function (types, getPrimary, getExpressionList, getRefinement, errors) {

	'use strict';
	
	return function ( parser ) {
		var current, expression, refinement, expressionList;
	
		expression = getPrimary( parser );
	
		if ( !expression ) {
			return null;
		}
	
		while ( expression ) {
			current = parser.pos;
	
			if ( refinement = getRefinement( parser ) ) {
				expression = {
					t: types.MEMBER,
					x: expression,
					r: refinement
				};
			}
	
			else if ( parser.matchString( '(' ) ) {
				parser.allowWhitespace();
				expressionList = getExpressionList( parser );
	
				parser.allowWhitespace();
	
				if ( !parser.matchString( ')' ) ) {
					parser.error( errors.expectedParen );
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