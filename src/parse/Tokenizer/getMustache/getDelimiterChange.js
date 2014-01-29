define([
	'parse/Tokenizer/utils/makeRegexMatcher'
], function (
	makeRegexMatcher
) {

	'use strict';

	var getDelimiter = makeRegexMatcher( /^[^\s=]+/ );

	return function ( tokenizer ) {
		var start, opening, closing;

		if ( !tokenizer.getStringMatch( '=' ) ) {
			return null;
		}

		start = tokenizer.pos;

		// allow whitespace before new opening delimiter
		tokenizer.allowWhitespace();

		opening = getDelimiter( tokenizer );
		if ( !opening ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace (in fact, it's necessary...)
		tokenizer.allowWhitespace();

		closing = getDelimiter( tokenizer );
		if ( !closing ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace before closing '='
		tokenizer.allowWhitespace();

		if ( !tokenizer.getStringMatch( '=' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return [ opening, closing ];
	};

});
