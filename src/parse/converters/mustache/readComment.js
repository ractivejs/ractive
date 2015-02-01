import { COMMENT } from 'config/types';

export default function readComment ( parser, delimiters ) {
	var index;

	if ( !parser.matchString( '!' ) ) {
		return null;
	}

	index = parser.remaining().indexOf( delimiters.content[1] );

	if ( index !== -1 ) {
		parser.pos += index + delimiters.content[1].length;
		return { t: COMMENT };
	}
}