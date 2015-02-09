import { REGEXP_LITERAL } from 'config/types';

// as far as I can tell, this only falls over if modifiers are repeated erroneously
var regexpPattern = /^\/(?:(?=\\)..|[^\/])+\/[gimy]{0,4}(?=[\s\.\),])/;

export default function readNumberLiteral ( parser ) {
	var result;

	if ( result = parser.matchPattern( regexpPattern ) ) {
		return {
			t: REGEXP_LITERAL,
			v: result
		};
	}

	return null;
}
