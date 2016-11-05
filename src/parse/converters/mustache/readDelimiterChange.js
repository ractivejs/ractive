const delimiterChangePattern = /^[^\s=]+/;
const whitespacePattern = /^\s+/;

export default function readDelimiterChange ( parser ) {
	if ( !parser.matchString( '=' ) ) {
		return null;
	}

	const start = parser.pos;

	// allow whitespace before new opening delimiter
	parser.allowWhitespace();

	const opening = parser.matchPattern( delimiterChangePattern );
	if ( !opening ) {
		parser.pos = start;
		return null;
	}

	// allow whitespace (in fact, it's necessary...)
	if ( !parser.matchPattern( whitespacePattern ) ) {
		return null;
	}

	const closing = parser.matchPattern( delimiterChangePattern );
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
