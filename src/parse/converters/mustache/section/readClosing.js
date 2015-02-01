import { CLOSING } from 'config/types';

export default function readClosing ( parser, delimiters ) {
	var start, remaining, index, closing;

	start = parser.pos;

	if ( !parser.matchString( delimiters.content[0] ) ) {
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '/' ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	remaining = parser.remaining();
	index = remaining.indexOf( delimiters.content[1] );

	if ( index !== -1 ) {
		closing = {
			t: CLOSING,
			r: remaining.substr( 0, index ).split( ' ' )[0]
		};

		parser.pos += index;

		if ( !parser.matchString( delimiters.content[1] ) ) {
			parser.error( `Expected closing delimiter '${delimiters.content[1]}'` );
		}

		return closing;
	}

	parser.pos = start;
	return null;
}