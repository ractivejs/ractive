define([
	'config/types',
	'parse/Tokenizer/getMustache/getDelimiterChange',
	'parse/Tokenizer/getMustache/getMustacheContent'
], function (
	types,
	getDelimiterChange,
	getMustacheContent
) {
	
	'use strict';

	return function () {
		// if the triple delimiter (e.g. '{{{') is longer than the regular mustache
		// delimiter (e.g. '{{') then we need to try and find a triple first. Otherwise
		// we will get a false positive if the mustache delimiter is a substring of the
		// triple delimiter, as in the default case
		var seekTripleFirst = ( this.tripleDelimiters[0].length > this.delimiters[0].length );
		return getMustache( this, seekTripleFirst ) || getMustache( this, !seekTripleFirst );
	};

	function getMustache ( tokenizer, seekTriple ) {
		var start = tokenizer.pos, content, delimiters;

		delimiters = ( seekTriple ? tokenizer.tripleDelimiters : tokenizer.delimiters );

		if ( !tokenizer.getStringMatch( delimiters[0] ) ) {
			return null;
		}

		// delimiter change?
		content = getDelimiterChange( tokenizer );
		if ( content ) {
			// find closing delimiter or abort...
			if ( !tokenizer.getStringMatch( delimiters[1] ) ) {
				tokenizer.pos = start;
				return null;
			}

			// ...then make the switch
			tokenizer[ seekTriple ? 'tripleDelimiters' : 'delimiters' ] = content;
			return { type: types.MUSTACHE, mustacheType: types.DELIMCHANGE };
		}

		tokenizer.allowWhitespace();

		content = getMustacheContent( tokenizer, seekTriple );

		if ( content === null ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace before closing delimiter
		tokenizer.allowWhitespace();

		if ( !tokenizer.getStringMatch( delimiters[1] ) ) {
			tokenizer.pos = start;
			return null;

			// TODO? tokenizer.expected( '"' + delimiters[1] + '"' );
		}

		return content;
	}

});