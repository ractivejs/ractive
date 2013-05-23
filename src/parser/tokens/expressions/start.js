expr.start = function ( tokenizer ) {
	var tokens = [], token;

	while ( tokenizer.pos < tokenizer.str.length ) {
		token = expr.mustache( tokenizer ) ||
		        expr.triple( tokenizer ) ||
		        expr.tag( tokenizer ) ||
		        expr.text( tokenizer );

		if ( token === null && tokenizer.remaining() ) {
			throw new Error( 'Could not parse template' );
		}

		tokens[ tokens.length ] = token;
	}

	return tokens;
};