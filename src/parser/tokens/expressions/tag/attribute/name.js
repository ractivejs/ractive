(function ( expr ) {

	var attrNamePattern = /^[^\s"'>\/=]+/;

	expr.attrName = function ( tokenizer ) {
		var start, match;

		start = tokenizer.pos;

		// allow whitespace
		expr.whitespace( tokenizer );

		match = attrNamePattern.exec( tokenizer.str.substring( tokenizer.pos ) );

		if ( !match ) {
			return null;
		}

		tokenizer.pos += match[0].length;
		return match[0];
	};

}( expr ));