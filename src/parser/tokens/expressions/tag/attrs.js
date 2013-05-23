expr.attrs = function ( tokenizer ) {
	var attrs, attr;

	attr = expr.attr( tokenizer );

	if ( !attr ) {
		return null;
	}

	attrs = [];

	while ( attr !== null ) {
		attrs[ attrs.length ] = attr;
		attr = expr.attr( tokenizer );
	}

	return attrs;
};