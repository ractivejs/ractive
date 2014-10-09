import types from 'config/types';
import getKeyValuePairs from 'parse/Parser/expressions/primary/literal/objectLiteral/keyValuePairs';

export default function ( parser ) {
	var start, keyValuePairs;

	start = parser.pos;

	// allow whitespace
	parser.allowWhitespace();

	if ( !parser.matchString( '{' ) ) {
		parser.pos = start;
		return null;
	}

	keyValuePairs = getKeyValuePairs( parser );

	// allow whitespace between final value and '}'
	parser.allowWhitespace();

	if ( !parser.matchString( '}' ) ) {
		parser.pos = start;
		return null;
	}

	return {
		t: types.OBJECT_LITERAL,
		m: keyValuePairs
	};
}
