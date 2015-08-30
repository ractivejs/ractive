import { CLOSING } from '../../../../config/types';

export default function readClosing ( parser, tag ) {
	var start, remaining, index, closing;

	start = parser.pos;

	if ( !parser.matchString( tag.open ) ) {
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '/' ) ) {
		parser.pos = start;
		return null;
	}

	parser.allowWhitespace();

	remaining = parser.remaining();
	index = remaining.indexOf( tag.close );

	if ( index !== -1 ) {
		closing = {
			t: CLOSING,
			r: remaining.substr( 0, index ).split( ' ' )[0]
		};

		parser.pos += index;

		if ( !parser.matchString( tag.close ) ) {
			parser.error( `Expected closing delimiter '${tag.close}'` );
		}

		return closing;
	}

	parser.pos = start;
	return null;
}
