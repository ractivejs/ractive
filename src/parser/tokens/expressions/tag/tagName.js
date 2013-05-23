(function ( expr ) {

	var tagNamePattern = /^[a-zA-Z][a-zA-Z0-9]*/;

	expr.tagName = function ( tokenizer ) {
		var match;

		match = tagNamePattern.exec( tokenizer.str.substring( tokenizer.pos ) );

		if ( !match ) {
			return null;
		}

		tokenizer.pos += match[0].length;
		return match[0];
	};

}( expr ));
