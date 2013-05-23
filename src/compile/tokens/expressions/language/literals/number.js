expr.numberLiteral = function ( tokenizer ) {
	var start, result;

	start = tokenizer.pos;

	result = expr.integer( tokenizer );
	if ( result === null ) {
		return null;
	}

	result += expr.fraction( tokenizer ) || '';
	result += expr.exponent( tokenizer ) || '';

	return {
		type: NUMBER_LITERAL,
		value: +result
	};
};