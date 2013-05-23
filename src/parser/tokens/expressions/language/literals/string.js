expr.stringLiteral = function ( tokenizer ) {
	var start, string;

	start = tokenizer.pos;

	if ( expr.generic( tokenizer, '"' ) ) {
		string = expr.doubleQuotedString( tokenizer );
	
		if ( !expr.generic( tokenizer, '"' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			type: STRING_LITERAL,
			value: string
		};
	}

	if ( expr.generic( tokenizer, "'" ) ) {
		string = expr.singleQuotedString( tokenizer );

		if ( !expr.generic( tokenizer, "'" ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			type: STRING_LITERAL,
			value: string
		};
	}

	return null;
};

expr.singleQuotedString = function ( tokenizer ) {
	var start, string, escaped, unescaped, next;

	start = tokenizer.pos;

	string = '';

	escaped = expr.escapedChars( tokenizer );
	if ( escaped ) {
		string += escaped;
	}

	unescaped = expr.unescapedSingleQuotedChars( tokenizer );
	if ( unescaped ) {
		string += unescaped;
	}
	if ( string ) {
		next = expr.singleQuotedString( tokenizer );
		while ( next ) {
			string += next;
			next = expr.singleQuotedString( tokenizer );
		}
	}

	return string;
};

expr.unescapedSingleQuotedChars = expr.regex( /^[^\\']+/ );

expr.doubleQuotedString = function ( tokenizer ) {
	var start, string, escaped, unescaped, next;

	start = tokenizer.pos;

	string = '';

	escaped = expr.escapedChars( tokenizer );
	if ( escaped ) {
		string += escaped;
	}

	unescaped = expr.unescapedDoubleQuotedChars( tokenizer );
	if ( unescaped ) {
		string += unescaped;
	}

	if ( !string ) {
		return '';
	}

	next = expr.doubleQuotedString( tokenizer );
	while ( next !== '' ) {
		string += next;
	}

	return string;
};

expr.unescapedDoubleQuotedChars = expr.regex( /^[^\\"]+/ );

expr.escapedChars = function ( tokenizer ) {
	var chars = '', char;

	char = expr.escapedChar( tokenizer );
	while ( char ) {
		chars += char;
		char = expr.escapedChar( tokenizer );
	}

	return chars || null;
};

expr.escapedChar = function ( tokenizer ) {
	var char;

	if ( !expr.generic( tokenizer, '\\' ) ) {
		return null;
	}

	char = tokenizer.str.charAt( tokenizer.pos );
	tokenizer.pos += 1;

	return char;
};