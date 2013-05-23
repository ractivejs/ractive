expr.reference = function ( tokenizer ) {
	var name = expr.name( tokenizer );

	if ( name === null ) {
		return null;
	}

	return {
		type: REFERENCE,
		name: name
	};
};