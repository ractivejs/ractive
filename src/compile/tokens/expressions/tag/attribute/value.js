expr.attrValue = function ( tokenizer ) {
	var start, value;

	start = tokenizer.pos;

	expr.whitespace( tokenizer );

	if ( !expr.generic( tokenizer, '=' ) ) {
		tokenizer.pos = start;
		return null;
	}

	value = expr.singleQuotedAttrValue( tokenizer ) || expr.doubleQuotedAttrValue( tokenizer ) || expr.unquotedAttrValue( tokenizer );

	if ( value === null ) {
		tokenizer.pos = start;
		return null;
	}

	return value;
};