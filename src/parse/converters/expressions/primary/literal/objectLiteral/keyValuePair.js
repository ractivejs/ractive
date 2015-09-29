import { KEY_VALUE_PAIR, REFERENCE } from '../../../../../../config/types';
import readKey from '../../../shared/readKey';
import readExpression from '../../../../readExpression';

export default function readKeyValuePair ( parser ) {
	var start, key, value;

	start = parser.pos;

	// allow whitespace between '{' and key
	parser.allowWhitespace();

	const refKey = parser.nextChar() !== '\'' && parser.nextChar() !== '"';

	key = readKey( parser );
	if ( key === null ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between key and ':'
	parser.allowWhitespace();

	// es2015 shorthand property
	if ( refKey && ( parser.nextChar() === ',' || parser.nextChar() === '}' ) ) {
		return {
			t: KEY_VALUE_PAIR,
			k: key,
			v: {
				t: REFERENCE,
				n: key
			}
		};
	}

	// next character must be ':'
	if ( !parser.matchString( ':' ) ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between ':' and value
	parser.allowWhitespace();

	// next expression must be a, well... expression
	value = readExpression( parser );
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
