(function ( R, utils ) {
	
	'use strict';

	var whitespace,

		stripHtmlComments,
		stripStandalones,
		stripCommentTokens,
		TokenStream,
		MustacheBuffer,
		
		mustacheTypes;



	utils.tokenize = function ( template, options ) {
		var tokenizer, tokens;

		options = options || {};

		tokenizer = {
			str: utils.stripHtmlComments( template ),
			pos: 0,
			delimiters: options.delimiters || [ '{{', '}}' ],
			tripleDelimiters: options.tripleDelimiters || [ '{{{', '}}}' ],
			remaining: function () {
				return tokenizer.str.substring( tokenizer.pos );
			}
		};

		tokens = expr.start( tokenizer );

		utils.stripStandalones( tokens );
		utils.stripCommentTokens( tokens );
		
		return tokens;
	};
	
	
	



	whitespace = /\s/;
	mustacheTypes = {
		'#': SECTION,
		'^': INVERTED,
		'/': CLOSING,
		'>': PARTIAL,
		'!': COMMENT,
		'&': INTERPOLATOR
	};
	


}( Ractive, utils ));