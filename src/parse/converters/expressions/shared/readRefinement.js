import { REFINEMENT } from 'config/types';
import { expectedExpression } from './errors';
import { name as namePattern } from './patterns';
import readExpression from 'parse/converters/readExpression';

export default function readRefinement ( parser ) {
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

		expr = readExpression( parser );
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
