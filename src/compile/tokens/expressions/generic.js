expr.generic = function ( tokenizer, query ) {
	var substr;

	substr = tokenizer.str.substr( tokenizer.pos, query.length );

	if ( substr === query ) {
		tokenizer.pos += query.length;
		return query;
	}

	return null;
};