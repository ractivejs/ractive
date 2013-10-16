var getSingleQuotedString = function ( tokenizer ) {
	var start, string, escaped, unescaped, next;

	start = tokenizer.pos;

	string = '';

	escaped = getEscapedChars( tokenizer );
	if ( escaped ) {
		string += escaped;
	}

	unescaped = getUnescapedSingleQuotedChars( tokenizer );
	if ( unescaped ) {
		string += unescaped;
	}
	if ( string ) {
		next = getSingleQuotedString( tokenizer );
		while ( next ) {
			string += next;
			next = getSingleQuotedString( tokenizer );
		}
	}

	return string;
};

var getUnescapedSingleQuotedChars = getRegexMatcher( /^[^\\']+/ );