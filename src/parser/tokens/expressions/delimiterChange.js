(function ( expr ) {

	var delimiter = expr.regex( /^[^\s=]+/ );

	expr.delimiterChange = function ( tokenizer ) {
		var start, opening, closing;

		if ( !expr.generic( tokenizer, '=' ) ) {
			return null;
		}

		start = tokenizer.pos;

		// allow whitespace before new opening delimiter
		expr.whitespace( tokenizer );

		opening = delimiter( tokenizer );
		if ( !opening ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace (in fact, it's necessary...)
		expr.whitespace( tokenizer );

		closing = delimiter( tokenizer );
		if ( !closing ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace before closing '='
		expr.whitespace( tokenizer );

		if ( !expr.generic( tokenizer, '=' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return [ opening, closing ];
	};

}( expr ));