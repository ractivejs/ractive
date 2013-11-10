define([
	'parse/utils/stripHtmlComments',
	'parse/utils/stripStandalones',
	'parse/utils/stripCommentTokens',
	'parse/Tokenizer/_Tokenizer'
], function (
	stripHtmlComments,
	stripStandalones,
	stripCommentTokens,
	Tokenizer
) {

	'use strict';

	var tokenize,

		// dependencies
		Ractive;

	loadCircularDependency( function () {
		require([ 'Ractive/_Ractive' ], function ( dep ) {
			Ractive = dep;
		});
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