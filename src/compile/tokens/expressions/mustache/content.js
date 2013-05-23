expr.mustacheContent = function ( tokenizer ) {
	var start, fail, mustache, type, expression, indexRef, remaining, index;

	start = tokenizer.pos;

	mustache = { type: MUSTACHE };

	// mustache type
	type = expr.mustacheType( tokenizer );
	mustache.mustacheType = type || INTERPOLATOR; // default

	// if it's a comment, allow any contents except '}}'
	if ( type === COMMENT ) {
		remaining = tokenizer.remaining();
		index = remaining.indexOf( tokenizer.delimiters[1] );

		if ( index !== -1 ) {
			tokenizer.pos += index;
			return mustache;
		}
	}

	// allow whitespace
	expr.whitespace( tokenizer );

	// is this an expression?
	if ( expr.generic( tokenizer, '(' ) ) {
		
		// looks like it...
		expression = expr.expression( tokenizer );
		// if ( !expression ) {
		// 	tokenizer.pos = start;
		// 	return null;
		// }

		expr.whitespace( tokenizer );

		if ( !expr.generic( tokenizer, ')' ) ) {
			tokenizer.pos = start;
			return null;
		}

		mustache.expression = expression;
	}

	else {
		// mustache reference
		mustache.ref = expr.mustacheRef( tokenizer );
		if ( !mustache.ref ) {
			tokenizer.pos = start;
			return null;
		}
	}

	

	// optional index reference
	indexRef = expr.indexRef( tokenizer );
	if ( indexRef !== null ) {
		mustache.indexRef = indexRef;
	}

	return mustache;
};