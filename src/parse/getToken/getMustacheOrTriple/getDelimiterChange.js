define([
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/utils/getRegexMatcher',
	'parse/getToken/utils/allowWhitespace'
], function (
	getStringMatch,
	getRegexMatcher,
	allowWhitespace
) {
	
	'use strict';

	var getDelimiter = getRegexMatcher( /^[^\s=]+/ );

	return function ( tokenizer ) {
		var start, opening, closing;

		if ( !getStringMatch( tokenizer, '=' ) ) {
			return null;
		}

		start = tokenizer.pos;

		// allow whitespace before new opening delimiter
		allowWhitespace( tokenizer );

		opening = getDelimiter( tokenizer );
		if ( !opening ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace (in fact, it's necessary...)
		allowWhitespace( tokenizer );

		closing = getDelimiter( tokenizer );
		if ( !closing ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace before closing '='
		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, '=' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return [ opening, closing ];
	};

});