import { MEMBER, INVOCATION } from 'config/types';
import readPrimary from './readPrimary';
import readExpressionList from './shared/readExpressionList';
import readRefinement from './shared/readRefinement';
import { expectedParen } from './shared/errors';

export default function ( parser ) {
	var current, expression, refinement, expressionList;

	expression = readPrimary( parser );

	if ( !expression ) {
		return null;
	}

	while ( expression ) {
		current = parser.pos;

		if ( refinement = readRefinement( parser ) ) {
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
