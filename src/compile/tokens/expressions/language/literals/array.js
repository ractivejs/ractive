expr.arrayLiteral = function ( tokenizer ) {
	var start, array, expressions;

	start = tokenizer.pos;

	// allow whitespace before '['
	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, '[' ) ) {
		tokenizer.pos = start;
		return null;
	}

	expressions = expr.expressionList( tokenizer );

	if ( !expr.generic( tokenizer, ']' ) ) {
		tokenizer.pos = start;
		return null;
	}

	return {
		type: ARRAY_LITERAL,
		members: expressions
	};
};