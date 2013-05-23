expr.openingTag = function ( tokenizer ) {
	var start, tag, attrs;

	start = tokenizer.pos;

	if ( !expr.generic( tokenizer, '<' ) ) {
		return null;
	}

	tag = {
		type: TAG
	};

	// tag name
	tag.name = expr.tagName( tokenizer );
	if ( !tag.name ) {
		tokenizer.pos = start;
		return null;
	}

	// attributes
	attrs = expr.attrs( tokenizer );
	if ( attrs ) {
		tag.attrs = attrs;
	}

	// self-closing solidus?
	if ( expr.generic( tokenizer, '/' ) ) {
		tag.selfClosing = true;
	}

	// closing angle bracket
	if ( !expr.generic( tokenizer, '>' ) ) {
		tokenizer.pos = start;
		return null;
	}

	return tag;
};