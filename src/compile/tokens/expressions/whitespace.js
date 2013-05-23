(function ( expr, whitespace ) {

	expr.whitespace = function ( tokenizer ) {
		var match = whitespace.exec( tokenizer.str.substring( tokenizer.pos ) );

		if ( !match ) {
			return null;
		}

		tokenizer.pos += match[0].length;
		return match[0];
	};

}( expr, /^\s+/ ));