import { KEY_VALUE_PAIR, REFERENCE } from 'src/config/types';
import readKey from '../../../shared/readKey';
import readExpression from '../../../../readExpression';
import { name as namePattern, spreadPattern } from '../../../shared/patterns';

export default function readKeyValuePair ( parser ) {
	let spread;
	const start = parser.pos;

	// allow whitespace between '{' and key
	parser.sp();

	const refKey = parser.nextChar() !== '\'' && parser.nextChar() !== '"';
	if ( refKey ) spread = parser.matchPattern( spreadPattern );

	const key = spread ? readExpression( parser ) : readKey( parser );
	if ( key === null ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between key and ':'
	parser.sp();

	// es2015 shorthand property
	if ( refKey && ( parser.nextChar() === ',' || parser.nextChar() === '}' ) ) {
		if ( !spread && !namePattern.test( key ) ) {
			parser.error( `Expected a valid reference, but found '${key}' instead.` );
		}

		const pair = {
			t: KEY_VALUE_PAIR,
			k: key,
			v: {
				t: REFERENCE,
				n: key
			}
		};

		if ( spread ) {
			pair.p = true;
		}

		return pair;
	}


	// next character must be ':'
	if ( !parser.matchString( ':' ) ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace between ':' and value
	parser.sp();

	// next expression must be a, well... expression
	const value = readExpression( parser );
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
