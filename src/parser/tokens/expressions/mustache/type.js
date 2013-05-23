var mustacheTypes = {
	'#': SECTION,
	'^': INVERTED,
	'/': CLOSING,
	'>': PARTIAL,
	'!': COMMENT,
	'&': INTERPOLATOR
};

expr.mustacheType = function ( tokenizer ) {
	var type = mustacheTypes[ tokenizer.str.charAt( tokenizer.pos ) ];

	if ( !type ) {
		return null;
	}

	tokenizer.pos += 1;
	return type;
};