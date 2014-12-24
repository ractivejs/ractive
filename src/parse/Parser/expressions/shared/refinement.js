import { REFINEMENT } from 'config/types';
import { expectedExpression } from './errors';
import { name as namePattern } from './patterns';

export default function getRefinement ( parser ) {
	var start, name, expr;

	start = parser.pos;

	parser.allowWhitespace();

	// "." name
	if ( parser.matchString( '.' ) ) {
		parser.allowWhitespace();

		if ( name = parser.matchPattern( namePattern ) ) {
			return {
				t: REFINEMENT,
				n: name
			};
		}

		parser.error( 'Expected a property name' );
	}

	// "[" expression "]"
	if ( parser.matchString( '[' ) ) {
		parser.allowWhitespace();

		expr = parser.readExpression();
		if ( !expr ) {
			parser.error( expectedExpression );
		}

		parser.allowWhitespace();

		if ( !parser.matchString( ']' ) ) {
			parser.error( 'Expected \']\'' );
		}

		return {
			t: REFINEMENT,
			x: expr
		};
	}

	return null;
}
