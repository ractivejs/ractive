expr.attr = function ( tokenizer ) {
	var attr, name, value;

	name = expr.attrName( tokenizer );
	if ( !name ) {
		return null;
	}

	attr = {
		name: name
	};

	value = expr.attrValue( tokenizer );
	if ( value ) {
		attr.value = value;
	}

	return attr;
};