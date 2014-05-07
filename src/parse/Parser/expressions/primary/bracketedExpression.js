import types from 'config/types';

export default function ( parser ) {
	var start, expr;

	start = parser.pos;

	if ( !parser.matchString( '(' ) ) {
		return null;
	}

	parser.allowWhitespace();

	expr = parser.readExpression();
	if ( !expr ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchString( ')' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: types.BRACKETED,
		x: expr
	};
}
