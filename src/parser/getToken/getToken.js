getToken = function ( tokenizer ) {
	var token = getMustacheOrTriple( tokenizer ) ||
	        getTag( tokenizer ) ||
	        getText( tokenizer );

	return token;
};