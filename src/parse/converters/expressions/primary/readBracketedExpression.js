import { BRACKETED } from 'config/types';
import { expectedExpression, expectedParen } from '../shared/errors';
import readExpression from 'parse/converters/readExpression';

export default function readBracketedExpression ( parser ) {
	var start, expr;

	start = parser.pos;

	if ( !parser.matchString( '(' ) ) {
		return null;
	}

	parser.allowWhitespace();

	expr = readExpression( parser );
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
