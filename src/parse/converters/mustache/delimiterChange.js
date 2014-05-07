var delimiterChangePattern = /^[^\s=]+/, whitespacePattern = /^\s+/;

export default function ( parser ) {
	var start, opening, closing;

	if ( !parser.matchString( '=' ) ) {
		return null;
	}

	start = parser.pos;

	// allow whitespace before new opening delimiter
	parser.allowWhitespace();

	opening = parser.matchPattern( delimiterChangePattern );
	if ( !opening ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace (in fact, it's necessary...)
	if ( !parser.matchPattern( whitespacePattern ) ) {
		return null;
	}

	closing = parser.matchPattern( delimiterChangePattern );
	if ( !closing ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace before closing '='
	parser.allowWhitespace();

	if ( !parser.matchString( '=' ) ) {
		parser.pos = start;
		return null;
	}

	return [ opening, closing ];
}
