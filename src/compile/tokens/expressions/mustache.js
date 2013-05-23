expr.mustache = function ( tokenizer ) {
	var start = tokenizer.pos, content;

	if ( !expr.generic( tokenizer, tokenizer.delimiters[0] ) ) {
		return null;
	}

	// delimiter change?
	content = expr.delimiterChange( tokenizer );
	if ( content ) {
		// find closing delimiter or abort...
		if ( !expr.generic( tokenizer, tokenizer.delimiters[1] ) ) {
			tokenizer.pos = start;
			return null;
		}

		// ...then make the switch
		tokenizer.delimiters = content;
		return { type: MUSTACHE, mustacheType: DELIMCHANGE };
	}

	content = expr.mustacheContent( tokenizer );

	if ( content === null ) {
		tokenizer.pos = start;
		return null;
	}

	// allow whitespace before closing delimiter
	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, tokenizer.delimiters[1] ) ) {
		tokenizer.pos = start;
		return null;
	}

	return content;
};
