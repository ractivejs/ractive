define([
	'config/types',
	'parse/converters/mustache/delimiterChange',
	'parse/converters/mustache/content'
], function (
	types,
	delimiterChange,
	mustacheContent
) {

	'use strict';

	var sectionClosePatterns = {},
		delimiterChangeToken = { t: types.DELIMCHANGE, exclude: true };

	return getMustache;

	function getMustache ( parser ) {
		// if the triple delimiter (e.g. '{{{') is longer than the regular mustache
		// delimiter (e.g. '{{') then we need to try and find a triple first. Otherwise
		// we will get a false positive if the mustache delimiter is a substring of the
		// triple delimiter, as in the default case
		var seekTripleFirst = ( parser.tripleDelimiters[0].length > parser.delimiters[0].length );
		return getMustacheOrTriple( parser, seekTripleFirst ) || getMustacheOrTriple( parser, !seekTripleFirst );
	}

	function getMustacheOrTriple ( parser, seekTriple ) {
		var start = parser.pos, mustache, delimiters, children, child;

		delimiters = ( seekTriple ? parser.tripleDelimiters : parser.delimiters );

		if ( !parser.matchString( delimiters[0] ) ) {
			return null;
		}

		// delimiter change?
		if ( mustache = delimiterChange( parser ) ) {
			// find closing delimiter or abort...
			if ( !parser.matchString( delimiters[1] ) ) {
				return null;
			}

			// ...then make the switch
			parser[ seekTriple ? 'tripleDelimiters' : 'delimiters' ] = mustache;
			return delimiterChangeToken;
		}

		parser.allowWhitespace();

		mustache = mustacheContent( parser, seekTriple );

		if ( mustache === null ) {
			parser.pos = start;
			return null;
		}

		// allow whitespace before closing delimiter
		parser.allowWhitespace();

		if ( !parser.matchString( delimiters[1] ) ) {
			parser.error( 'Expected closing delimiter \'' + delimiters[1] + '\' after reference' );
		}

		if ( mustache.t === types.COMMENT ) {
			mustache.exclude = true;
		}

		// section children
		if ( mustache.t === types.SECTION || mustache.t === types.INVERTED ) {
			children = [];
			while ( child = parser.read() ) {
				if ( child.t === types.CLOSING ) {
					break;
				}

				children.push( child );
			}

			if ( children.length ) {
				mustache.f = children;
			}

			// there should be a section close now
			// if ( !parser.matchString( parser.delimiters[0] ) || !parser.matchPattern( sectionClosePattern ) || !parser.matchString( parser.delimiters[1] ) ) {
			// 	parser.error( 'Expected section closing tag' );
			// }
		}

		return mustache;
	}

});
