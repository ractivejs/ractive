define([
	'config/initOptions',
	'parse/utils/stripHtmlComments',
	'parse/utils/stripStandalones',
	'parse/utils/stripCommentTokens',
	'parse/Tokenizer/_Tokenizer'
], function (
	initOptions,
	stripHtmlComments,
	stripStandalones,
	stripCommentTokens,
	Tokenizer
) {

	'use strict';

	return function ( template, options ) {
		var tokenizer, tokens;

		options = options || {};

		if ( options.stripComments !== false ) {
			template = stripHtmlComments( template );
		}

		// TODO handle delimiters differently
		tokenizer = new Tokenizer( template, {
			delimiters: options.delimiters || initOptions.defaults.delimiters,
			tripleDelimiters: options.tripleDelimiters || initOptions.defaults.tripleDelimiters
		});

		// TODO and this...
		tokens = tokenizer.tokens;

		stripStandalones( tokens );
		stripCommentTokens( tokens );

		return tokens;
	};

});