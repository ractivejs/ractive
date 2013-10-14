// Match one or more characters until: ", ', \, or EOL/EOF.
// EOL/EOF is written as (?!.) (meaning there's no non-newline char next).
var getStringMiddle = getRegexMatcher(/^(?=.)[^"'\\]+?(?:(?!.)|(?=["'\\]))/);

// Match one escape sequence, including the backslash.
var getEscapeSequence = getRegexMatcher(/^\\(?:['"\\bfnrt]|0(?![0-9])|x[0-9a-fA-F]{2}|u[0-9a-fA-F]{4}|(?=.)[^ux0-9])/);

// Match one ES5 line continuation (backslash + line terminator).
var getLineContinuation = getRegexMatcher(/^\\(?:\r\n|[\u000A\u000D\u2028\u2029])/);


// Helper for defining getDoubleQuotedString and getSingleQuotedString.
var getQuotedStringMatcher = function (quote, okQuote) {
	return function ( tokenizer ) {
		var start, literal, done, next;

		start = tokenizer.pos;
		literal = '"';
		done = false;

		while (! done) {
			next = (getStringMiddle( tokenizer ) || getEscapeSequence( tokenizer ) ||
				getStringMatch( tokenizer, okQuote));
			if ( next ) {
				if ( next === '"' ) {
					literal += '\\"';
				} else if (next === "\\'") {
					literal += "'";
				} else {
					literal += next;
				}
			} else {
				next = getLineContinuation( tokenizer );
				if ( next ) {
					// convert \(newline-like) into a \u escape, which is allowed in JSON
					literal += '\\u' + ('000' + next.charCodeAt(1).toString(16)).slice(-4);
				} else {
					done = true;
				}
			}
		}

		literal += '"';

		// use JSON.parse to interpret escapes
		return JSON.parse(literal);
	};
};

var getDoubleQuotedString = getQuotedStringMatcher('"', "'");

var getSingleQuotedString = getQuotedStringMatcher("'", '"');
