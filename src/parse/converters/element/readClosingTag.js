import { CLOSING_TAG } from '../../../constants/types';

var closingTagPattern = /^([a-zA-Z]{1,}:?[a-zA-Z0-9\-]*)\s*\>/;

export default function readClosingTag ( parser ) {
	var start, tag;

	start = parser.pos;

	// are we looking at a closing tag?
	if ( !parser.matchString( '</' ) ) {
		return null;
	}

	if ( tag = parser.matchPattern( closingTagPattern ) ) {
		if ( parser.inside && tag !== parser.inside ) {
			parser.pos = start;
			return null;
		}

		return {
			t: CLOSING_TAG,
			e: tag
		};
	}

	// We have an illegal closing tag, report it
	parser.pos -= 2;
	parser.error( 'Illegal closing tag' );
}
