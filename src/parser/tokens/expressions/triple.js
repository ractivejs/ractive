expr.triple = function ( tokenizer ) {
	var start = tokenizer.pos, content;

	if ( !expr.generic( tokenizer, tokenizer.tripleDelimiters[0] ) ) {
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
		tokenizer.tripleDelimiters = content;
		return { type: DELIMCHANGE };
	}

	// allow whitespace between opening delimiter and reference
	expr.whitespace( tokenizer );

	content = expr.mustacheRef( tokenizer );

	if ( content === null ) {
		tokenizer.pos = start;
		return null;
	}

	// allow whitespace between reference and closing delimiter
	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, tokenizer.tripleDelimiters[1] ) ) {
		tokenizer.pos = start;
		return null;
	}

	return {
		type: TRIPLE,
		ref: content
	};
};