import { ARRAY_LITERAL } from 'config/types';
import getExpressionList from '../../shared/expressionList';

export default function ( parser ) {
	var start, expressionList;

	start = parser.pos;

	// allow whitespace before '['
	parser.allowWhitespace();

	if ( !parser.matchString( '[' ) ) {
		parser.pos = start;
		return null;
	}

	expressionList = getExpressionList( parser );

	if ( !parser.matchString( ']' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: ARRAY_LITERAL,
		m: expressionList
	};
}
