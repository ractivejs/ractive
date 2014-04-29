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

	var delimiterChangeToken = { t: types.DELIMCHANGE, exclude: true };

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
		var start, startPos, mustache, delimiters, children, elseChildren, currentChildren, child;

		start = parser.pos;
		startPos = parser.getLinePos();

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
		if ( mustache.t === types.SECTION ||
			 mustache.t === types.SECTION_IF ||
			 mustache.t === types.SECTION_UNLESS ||
			 mustache.t === types.SECTION_EACH ||
			 mustache.t === types.SECTION_WITH ||
			 mustache.t === types.SECTION_TRY ||
			 mustache.t === types.INVERTED ) {

			children = [];
			currentChildren = children;

			var expectedClose;

			if (parser.options.strict || parser.handlebars) {
				switch ( mustache.t ) {
					case types.SECTION_IF:
						expectedClose = 'if';
						break;
					case types.SECTION_EACH:
						expectedClose = 'each';
						break;
					case types.SECTION_TRY:
						expectedClose = 'try';
						break;
					case types.SECTION_UNLESS:
						expectedClose = 'unless';
						break;
					case types.SECTION_WITH:
						expectedClose = 'with';
						break;
				}
			}


			while ( child = parser.read() ) {
				if ( child.t === types.CLOSING ) {
					if (expectedClose && child.r !== expectedClose) {
						parser.error("Expected {{/" + expectedClose + "}}");
					}
					break;
				}

				if ( parser.handlebars && child.t === types.INTERPOLATOR && child.r === 'else') {
					switch ( mustache.t ) {
						case types.SECTION_IF:
						case types.SECTION_EACH:
						case types.SECTION_TRY:
							currentChildren = elseChildren = [];
							continue; // don't add this item to children

						case types.SECTION_UNLESS:
							parser.error( '{{else}} not allowed in {{#unless}}' );
							break;

						case types.SECTION_WITH:
							parser.error( '{{else}} not allowed in {{#with}}' );
							break;
					}
				}

				currentChildren.push( child );
			}

			if ( children.length ) {
				mustache.f = children;
			}

			if ( elseChildren && elseChildren.length ) {
				mustache.l = elseChildren;
			}

			// there should be a section close now
			// if ( !parser.matchString( parser.delimiters[0] ) || !parser.matchPattern( sectionClosePattern ) || !parser.matchString( parser.delimiters[1] ) ) {
			// 	parser.error( 'Expected section closing tag' );
			// }
		}

		if ( parser.includeLinePositions ) {
			mustache.p = startPos.toJSON();
		}

		return mustache;
	}

});
