var getEscapedChar = function ( tokenizer ) {
	var character;

	if ( !getStringMatch( tokenizer, '\\' ) ) {
		return null;
	}

	character = tokenizer.str.charAt( tokenizer.pos );
	tokenizer.pos += 1;

	return character;
};