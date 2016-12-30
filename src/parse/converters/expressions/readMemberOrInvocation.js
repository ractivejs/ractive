import { MEMBER, INVOCATION } from '../../../config/types';
import readPrimary from './readPrimary';
import readExpressionList from './shared/readExpressionList';
import readRefinement from './shared/readRefinement';
import { expectedParen } from './shared/errors';

export default function ( parser ) {
	let expression = readPrimary( parser );

	if ( !expression ) return null;

	while ( expression ) {
		const refinement = readRefinement( parser );
		if ( refinement ) {
			expression = {
				t: MEMBER,
				x: expression,
				r: refinement
			};
		}

		else if ( parser.matchString( '(' ) ) {
			parser.allowWhitespace();
			let start = parser.spreadArgs;
			parser.spreadArgs = true;
			const expressionList = readExpressionList( parser );
			parser.spreadArgs = start;

			parser.allowWhitespace();

			if ( !parser.matchString( ')' ) ) {
				parser.error( expectedParen );
			}

			expression = {
				t: INVOCATION,
				x: expression
			};

			if ( expressionList ) expression.o = expressionList;
		}

		else {
			break;
		}
	}

	return expression;
}
