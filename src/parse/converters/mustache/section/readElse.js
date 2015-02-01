import { ELSE } from 'config/types';

var elsePattern = /^\s*else\s*/;

export default function readElse ( parser, delimiters ) {
	var start = parser.pos;

	if ( !parser.matchString( delimiters.content[0] ) ) {
		return null;
	}

	if ( !parser.matchPattern( elsePattern ) ) {
		parser.pos = start;
		return null;
	}

	if ( !parser.matchString( delimiters.content[1] ) ) {
		parser.error( `Expected closing delimiter '${delimiters.content[1]}'` );
	}

	return {
		t: ELSE
	};
}