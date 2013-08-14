var getDoubleQuotedString = function ( tokenizer ) {
	var start, string, escaped, unescaped, next;

	start = tokenizer.pos;

	string = '';

	escaped = getEscapedChars( tokenizer );
	if ( escaped ) {
		string += escaped;
	}

	unescaped = getUnescapedDoubleQuotedChars( tokenizer );
	if ( unescaped ) {
		string += unescaped;
	}

	if ( !string ) {
		return '';
	}

	next = getDoubleQuotedString( tokenizer );
	while ( next !== '' ) {
		string += next;
	}

	return string;
};

var getUnescapedDoubleQuotedChars = getRegexMatcher( /^[^\\"]+/ );