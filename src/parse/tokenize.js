define([
	'parse/utils/stripHtmlComments',
	'parse/utils/stripStandalones',
	'parse/utils/stripCommentTokens',
	'parse/Tokenizer/_Tokenizer',
	'circular'
], function (
	stripHtmlComments,
	stripStandalones,
	stripCommentTokens,
	Tokenizer,
	circular
) {

	'use strict';

	var tokenize, Ractive;

	circular.push( function () {
		Ractive = circular.Ractive;
	});

	tokenize = function ( template, options ) {
		var tokenizer, tokens;

		options = options || {};

		if ( options.stripComments !== false ) {
			template = stripHtmlComments( template );
		}

		// TODO handle delimiters differently
		tokenizer = new Tokenizer( template, {
			delimiters: options.delimiters || ( Ractive ? Ractive.delimiters : [ '{{', '}}' ] ),
			tripleDelimiters: options.tripleDelimiters || ( Ractive ? Ractive.tripleDelimiters : [ '{{{', '}}}' ] )
		});

		// TODO and this...
		tokens = tokenizer.tokens;

		stripStandalones( tokens );
		stripCommentTokens( tokens );

		return tokens;
	};

	return tokenize;

});