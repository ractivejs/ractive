import { MEMBER, INVOCATION } from 'config/types';
import getPrimary from './primary/_primary';
import readExpressionList from './shared/expressionList';
import getRefinement from './shared/refinement';
import { expectedParen } from './shared/errors';

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
				t: MEMBER,
				x: expression,
				r: refinement
			};
		}

		else if ( parser.matchString( '(' ) ) {
			parser.allowWhitespace();
			expressionList = readExpressionList( parser );

			parser.allowWhitespace();

			if ( !parser.matchString( ')' ) ) {
				parser.error( expectedParen );
			}

			expression = {
				t: INVOCATION,
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
