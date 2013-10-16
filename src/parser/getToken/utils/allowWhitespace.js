var allowWhitespace = function ( tokenizer ) {
	var match = leadingWhitespace.exec( tokenizer.str.substring( tokenizer.pos ) );

	if ( !match ) {
		return null;
	}

	tokenizer.pos += match[0].length;
	return match[0];
};