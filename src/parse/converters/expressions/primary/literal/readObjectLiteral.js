import { OBJECT_LITERAL } from '../../../../../config/types';
import readKeyValuePairs from './objectLiteral/keyValuePairs';

export default function ( parser ) {
	let start, keyValuePairs;

	start = parser.pos;

	// allow whitespace
	parser.allowWhitespace();

	if ( !parser.matchString( '{' ) ) {
		parser.pos = start;
		return null;
	}

	keyValuePairs = readKeyValuePairs( parser );

	// allow whitespace between final value and '}'
	parser.allowWhitespace();

	if ( !parser.matchString( '}' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: OBJECT_LITERAL,
		m: keyValuePairs
	};
}
