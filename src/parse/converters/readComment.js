import { COMMENT } from 'config/types';

var OPEN_COMMENT = '<!--',
	CLOSE_COMMENT = '-->';

export default function ( parser ) {
	var start, content, remaining, endIndex, comment;

	start = parser.pos;

	if ( !parser.matchString( OPEN_COMMENT ) ) {
		return null;
	}

	remaining = parser.remaining();
	endIndex = remaining.indexOf( CLOSE_COMMENT );

	if ( endIndex === -1 ) {
		parser.error( 'Illegal HTML - expected closing comment sequence (\'-->\')' );
	}

	content = remaining.substr( 0, endIndex );
	parser.pos += endIndex + 3;

	comment = {
		t: COMMENT,
		c: content
	};

	if ( parser.includeLinePositions ) {
		comment.p = parser.getLinePos( start );
	}

	return comment;
}
