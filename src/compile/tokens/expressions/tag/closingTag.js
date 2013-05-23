expr.closingTag = function ( tokenizer ) {
	var start, tag;

	start = tokenizer.pos;

	if ( !expr.generic( tokenizer, '<' ) ) {
		return null;
	}

	tag = { type: TAG, closing: true };

	// closing solidus
	if ( !expr.generic( tokenizer, '/' ) ) {
		tokenizer.pos = start;
		return null;
	}

	// tag name
	tag.name = expr.tagName( tokenizer );
	if ( !tag.name ) {
		tokenizer.pos = start;
		return null;
	}

	// closing angle bracket
	if ( !expr.generic( tokenizer, '>' ) ) {
		tokenizer.pos = start;
		return null;
	}

	return tag;
};