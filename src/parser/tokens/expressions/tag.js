expr.tag = function ( tokenizer ) {
	return ( expr.openingTag( tokenizer ) || expr.closingTag( tokenizer ) );
};