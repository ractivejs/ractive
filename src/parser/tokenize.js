var tokenize = function ( template, options ) {
	var tokenizer, tokens;

	options = options || {};

	tokenizer = {
		str: stripHtmlComments( template ),
		pos: 0,
		delimiters: options.delimiters || [ '{{', '}}' ],
		tripleDelimiters: options.tripleDelimiters || [ '{{{', '}}}' ],
		remaining: function () {
			return tokenizer.str.substring( tokenizer.pos );
		}
	};

	tokens = expr.start( tokenizer );

	stripStandalones( tokens );
	stripCommentTokens( tokens );
	
	return tokens;
};