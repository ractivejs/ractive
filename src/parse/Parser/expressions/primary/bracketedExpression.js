import types from 'config/types';
import errors from 'parse/Parser/expressions/shared/errors';

export default function ( parser ) {
	var start, expr;

	start = parser.pos;

	if ( !parser.matchString( '(' ) ) {
		return null;
	}

	parser.allowWhitespace();

	expr = parser.readExpression();
	if ( !expr ) {
		parser.error( errors.expectedExpression )
	}

	parser.allowWhitespace();

	if ( !parser.matchString( ')' ) ) {
		parser.error( errors.expectedParen );
	}

	return {
		t: types.BRACKETED,
		x: expr
	};
}
