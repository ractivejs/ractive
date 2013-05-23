expr.booleanLiteral = function ( tokenizer ) {
	var remaining = tokenizer.remaining();

	if ( remaining.substr( 0, 4 ) === 'true' ) {
		tokenizer.pos += 4;
		return {
			type: BOOLEAN_LITERAL,
			value: 'true'
		};
	}

	if ( remaining.substr( 0, 5 ) === 'false' ) {
		tokenizer.pos += 5;
		return {
			type: BOOLEAN_LITERAL,
			value: 'false'
		};
	}

	return null;
};