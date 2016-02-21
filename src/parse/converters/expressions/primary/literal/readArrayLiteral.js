import { ARRAY_LITERAL } from '../../../../../constants/types';
import readExpressionList from '../../shared/readExpressionList';

export default function ( parser ) {
	var start, expressionList;

	start = parser.pos;

	// allow whitespace before '['
	parser.allowWhitespace();

	if ( !parser.matchString( '[' ) ) {
		parser.pos = start;
		return null;
	}

	expressionList = readExpressionList( parser );

	if ( !parser.matchString( ']' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: ARRAY_LITERAL,
		m: expressionList
	};
}
