// Any literal except function and regexp literals, which aren't supported (yet?)
expr.literal = function ( tokenizer ) {
	var literal = expr.numberLiteral( tokenizer )   ||
	              expr.booleanLiteral( tokenizer )  ||
	              expr.global( tokenizer )          ||
	              expr.stringLiteral( tokenizer )   ||
	              expr.objectLiteral( tokenizer )   ||
	              expr.arrayLiteral( tokenizer );

	return literal;
};