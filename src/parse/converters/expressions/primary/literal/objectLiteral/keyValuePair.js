import { KEY_VALUE_PAIR } from 'config/types';
import getKey from '../../../shared/key';
import getExpression from 'parse/converters/expression';

export default function ( parser ) {
	var start, key, value;

	start = parser.pos;

	// allow whitespace between '{' and key
	parser.allowWhitespace();

	key = getKey( parser );
	if ( key === null ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between key and ':'
	parser.allowWhitespace();

	// next character must be ':'
	if ( !parser.matchString( ':' ) ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between ':' and value
	parser.allowWhitespace();

	// next expression must be a, well... expression
	value = getExpression( parser );
	if ( value === null ) {
		parser.pos = start;
		return null;
	}

	return {
		t: KEY_VALUE_PAIR,
		k: key,
		v: value
	};
}
