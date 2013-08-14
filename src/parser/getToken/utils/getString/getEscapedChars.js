var getEscapedChars = function ( tokenizer ) {
	var chars = '', character;

	character = getEscapedChar( tokenizer );
	while ( character ) {
		chars += character;
		character = getEscapedChar( tokenizer );
	}

	return chars || null;
};