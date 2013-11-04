define([
	'config/types',
	'parse/getToken/utils/getStringMatch',
	'parse/getToken/utils/allowWhitespace',
	'parse/getToken/getMustacheOrTriple/getDelimiterChange',
	'parse/getToken/getMustacheOrTriple/getMustacheContent'
], function (
	types,
	getStringMatch,
	allowWhitespace,
	getDelimiterChange,
	getMustacheContent
) {
	
	'use strict';

	return function ( tokenizer ) {
		// if the triple delimiter (e.g. '{{{') is longer than the regular mustache
		// delimiter (e.g. '{{') then we need to try and find a triple first. Otherwise
		// we will get a false positive if the mustache delimiter is a substring of the
		// triple delimiter, as in the default case
		var seekTripleFirst = ( tokenizer.tripleDelimiters[0].length > tokenizer.delimiters[0].length );
		return getMustache( tokenizer, seekTripleFirst ) || getMustache( tokenizer, !seekTripleFirst );
	};

	function getMustache ( tokenizer, seekTriple ) {
			var start = tokenizer.pos, content, delimiters;

			delimiters = ( seekTriple ? tokenizer.tripleDelimiters : tokenizer.delimiters );

			if ( !getStringMatch( tokenizer, delimiters[0] ) ) {
				return null;
			}

			// delimiter change?
			content = getDelimiterChange( tokenizer );
			if ( content ) {
				// find closing delimiter or abort...
				if ( !getStringMatch( tokenizer, delimiters[1] ) ) {
					tokenizer.pos = start;
					return null;
				}

				// ...then make the switch
				tokenizer[ seekTriple ? 'tripleDelimiters' : 'delimiters' ] = content;
				return { type: types.MUSTACHE, mustacheType: types.DELIMCHANGE };
			}

			allowWhitespace( tokenizer );

			content = getMustacheContent( tokenizer, seekTriple );

			if ( content === null ) {
				tokenizer.pos = start;
				return null;
			}

			// allow whitespace before closing delimiter
			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, delimiters[1] ) ) {
				tokenizer.pos = start;
				return null;

				// TODO? fail( tokenizer, '"' + delimiters[1] + '"' );
			}

			return content;
		}

});