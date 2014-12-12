import { BRACKETED } from 'config/types';
import { expectedExpression, expectedParen } from '../shared/errors';

export default function ( parser ) {
	var start, expr;

	start = parser.pos;

	if ( !parser.matchString( '(' ) ) {
		return null;
	}

	parser.allowWhitespace();

	expr = parser.readExpression();
	if ( !expr ) {
		parser.error( expectedExpression );
	}

	parser.allowWhitespace();

	if ( !parser.matchString( ')' ) ) {
		parser.error( expectedParen );
	}

	return {
		t: BRACKETED,
		x: expr
	};
}
