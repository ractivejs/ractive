define([
	'parse/utils/stripHtmlComments',
	'parse/utils/stripStandalones',
	'parse/utils/stripCommentTokens',
	'parse/getToken/getToken'
], function (
	stripHtmlComments,
	stripStandalones,
	stripCommentTokens,
	getToken
) {

	'use strict';

	var tokenize,

		// dependencies
		Ractive;

	loadCircularDependency( function () {
		// circular...
		require([ 'Ractive/_index' ], function ( dep ) {
			Ractive = dep;
		});
	});

	tokenize = function ( template, options ) {
		var tokenizer, tokens, token, last20, next20;

		options = options || {};

		if ( options.stripComments !== false ) {
			template = stripHtmlComments( template );
		}

		tokenizer = {
			str: template,
			pos: 0,
			delimiters: options.delimiters || ( Ractive ? Ractive.delimiters : [ '{{', '}}' ] ),
			tripleDelimiters: options.tripleDelimiters || ( Ractive ? Ractive.tripleDelimiters : [ '{{{', '}}}' ] ),
			remaining: function () {
				return tokenizer.str.substring( tokenizer.pos );
			}
		};

		tokens = [];

		while ( tokenizer.pos < tokenizer.str.length ) {
			token = getToken( tokenizer );

			if ( token === null && tokenizer.remaining() ) {
				last20 = tokenizer.str.substr( 0, tokenizer.pos ).substr( -20 );
				if ( last20.length === 20 ) {
					last20 = '...' + last20;
				}

				next20 = tokenizer.remaining().substr( 0, 20 );
				if ( next20.length === 20 ) {
					next20 = next20 + '...';
				}

				throw new Error( 'Could not parse template: ' + ( last20 ? last20 + '<- ' : '' ) + 'failed at character ' + tokenizer.pos + ' ->' + next20 );
			}

			tokens[ tokens.length ] = token;
		}

		stripStandalones( tokens );
		stripCommentTokens( tokens );

		return tokens;
	};

	return tokenize;

});