(function ( expr ) {

	var doubleQuotedStringToken = function ( tokenizer ) {
		var start, text, index;

		start = tokenizer.pos;

		text = expr.doubleQuotedString( tokenizer );

		if ( !text ) {
			return null;
		}

		if ( ( index = text.indexOf( tokenizer.delimiters[0] ) ) !== -1 ) {
			text = text.substr( 0, index );
			tokenizer.pos = start + text.length;
		}

		return {
			type: TEXT,
			value: text
		};
	};

	expr.doubleQuotedAttrValue = function ( tokenizer ) {
		var start, tokens, token;

		start = tokenizer.pos;

		if ( !expr.generic( tokenizer, '"' ) ) {
			return null;
		}

		tokens = [];

		token = expr.mustache( tokenizer ) || doubleQuotedStringToken( tokenizer );
		while ( token !== null ) {
			tokens[ tokens.length ] = token;
			token = expr.mustache( tokenizer ) || doubleQuotedStringToken( tokenizer );
		}

		if ( !expr.generic( tokenizer, '"' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return tokens;

	};

}( expr ));