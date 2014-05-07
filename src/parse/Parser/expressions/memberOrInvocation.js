import types from 'config/types';
import getPrimary from 'parse/Parser/expressions/primary/_primary';
import getExpressionList from 'parse/Parser/expressions/shared/expressionList';
import getRefinement from 'parse/Parser/expressions/shared/refinement';

export default function ( parser ) {
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
				parser.pos = current;
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
}
