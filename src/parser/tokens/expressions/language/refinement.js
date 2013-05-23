expr.refinement = function ( tokenizer ) {
	var start, refinement, name, expression;

	start = tokenizer.pos;

	// "." name
	if ( expr.generic( tokenizer, '.' ) ) {
		if ( name = expr.name( tokenizer ) ) {
			return {
				type: REFINEMENT,
				name: name
			};
		}

		tokenizer.pos = start;
		return null;
	}

	// "[" expression "]"
	if ( expr.generic( tokenizer, '[' ) ) {
		expression = expr.expression( tokenizer );
		if ( !expression || !expr.generic( tokenizer, ']' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return {
			type: REFINEMENT,
			expression: expression
		};
	}

	return null;
};