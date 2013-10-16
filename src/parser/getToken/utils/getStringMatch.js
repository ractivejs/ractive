var getStringMatch = function ( tokenizer, string ) {
	var substr;

	substr = tokenizer.str.substr( tokenizer.pos, string.length );

	if ( substr === string ) {
		tokenizer.pos += string.length;
		return string;
	}

	return null;
};