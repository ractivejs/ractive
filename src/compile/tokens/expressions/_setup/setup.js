expr.regex = function ( pattern ) {
	return function ( tokenizer ) {
		var match = pattern.exec( tokenizer.str.substring( tokenizer.pos ) );

		if ( !match ) {
			return null;
		}

		tokenizer.pos += match[0].length;
		return match[1] || match[0];
	};
};

// if null is used as a literal, we can't use it to indicate failure, so instead
// we pass a sentinel value to stand in for null
expr.nullSentinel = {};