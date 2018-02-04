import readStringLiteral from '../primary/literal/readStringLiteral';
import readNumberLiteral from '../primary/literal/readNumberLiteral';
import { name as namePattern } from './patterns';

const identifier = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

// http://mathiasbynens.be/notes/javascript-properties
// can be any name, string literal, or number literal
export default function readKey ( parser ) {
	let token;

	if ( token = readStringLiteral( parser ) ) {
		return identifier.test( token.v ) ? token.v : '"' + token.v.replace( /"/g, '\\"' ) + '"';
	}

	if ( token = readNumberLiteral( parser ) ) {
		return token.v;
	}

	if ( token = parser.matchPattern( namePattern ) ) {
		return token;
	}

	return null;
}
