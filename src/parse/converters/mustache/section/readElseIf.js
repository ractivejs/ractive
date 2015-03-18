import { ELSEIF } from 'config/types';
import readExpression from 'parse/converters/readExpression';

var elsePattern = /^\s*elseif\s+/;

export default function readElse ( parser, tag ) {
	var start = parser.pos, expression;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	if ( !parser.matchPattern( elsePattern ) ) {
		parser.pos = start;
		return null;
	}

	expression = readExpression( parser );

	if ( !parser.matchString( tag.close ) ) {
		parser.error( `Expected closing delimiter '${tag.close}'` );
	}

	return {
		t: ELSEIF,
		x: expression
	};
}