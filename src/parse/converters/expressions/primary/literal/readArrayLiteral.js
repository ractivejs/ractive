import { ARRAY_LITERAL } from '../../../../../config/types';
import readExpressionList from '../../shared/readExpressionList';

export default function ( parser ) {
	const start = parser.pos;

	// allow whitespace before '['
	parser.allowWhitespace();

	if ( !parser.matchString( '[' ) ) {
		parser.pos = start;
		return null;
	}

	const expressionList = readExpressionList( parser, true );

	if ( !parser.matchString( ']' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: ARRAY_LITERAL,
		m: expressionList
	};
}
