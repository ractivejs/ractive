(function ( expr ) {

	var unquotedAttrValueText = expr.regex( /^[^\s"'=<>`]+/ );

	var unquotedAttrValueToken = function ( tokenizer ) {
		var start, text, index;

		start = tokenizer.pos;

		text = unquotedAttrValueText( tokenizer );

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

	expr.unquotedAttrValue = function ( tokenizer ) {
		var tokens, token;

		tokens = [];

		token = expr.mustache( tokenizer ) || unquotedAttrValueToken( tokenizer );
		while ( token !== null ) {
			tokens[ tokens.length ] = token;
			token = expr.mustache( tokenizer ) || unquotedAttrValueToken( tokenizer );
		}

		if ( !tokens.length ) {
			return null;
		}

		return tokens;
	};

}( expr ));