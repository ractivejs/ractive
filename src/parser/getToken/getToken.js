getToken = function ( tokenizer ) {
	var token = getMustacheOrTriple( tokenizer ) ||
	        getComment( tokenizer ) ||
	        getTag( tokenizer ) ||
	        getText( tokenizer );

	return token;
};