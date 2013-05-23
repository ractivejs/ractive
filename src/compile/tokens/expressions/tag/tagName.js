(function ( expr, pattern ) {

	expr.tagName = function ( tokenizer ) {
		var match;

		match = pattern.exec( tokenizer.str.substring( tokenizer.pos ) );

		if ( !match ) {
			return null;
		}

		tokenizer.pos += match[0].length;
		return match[0];
	};

}( expr, /^[a-zA-Z][a-zA-Z0-9]*/ ));
