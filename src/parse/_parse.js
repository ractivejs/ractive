// Ractive.parse
// ===============
//
// Takes in a string, and returns an object representing the parsed template.
// A parsed template is an array of 1 or more 'descriptors', which in some
// cases have children.
//
// The format is optimised for size, not readability, however for reference the
// keys for each descriptor are as follows:
//
// * r - Reference, e.g. 'mustache' in {{mustache}}
// * t - Type code (e.g. 1 is text, 2 is interpolator...)
// * f - Fragment. Contains a descriptor's children
// * l - eLse fragment. Contains a descriptor's children in the else case
// * e - Element name
// * a - map of element Attributes, or proxy event/transition Arguments
// * d - Dynamic proxy event/transition arguments
// * n - indicates an iNverted section
// * i - Index reference, e.g. 'num' in {{#section:num}}content{{/section}}
// * v - eVent proxies (i.e. when user e.g. clicks on a node, fire proxy event)
// * x - eXpressions
// * s - String representation of an expression function
// * t0 - intro/outro Transition
// * t1 - intro Transition
// * t2 - outro Transition
// * o - decOrator
// * y - is doctYpe
// * c - is Content (e.g. of a comment node)
// * p - line Position information - array with line number and character position of each node

define([
	'config/types',
	'parse/Parser/_Parser',
	'parse/converters/mustache',
	'parse/converters/comment',
	'parse/converters/element',
	'parse/converters/text',
	'parse/utils/trimWhitespace',
	'parse/utils/stripStandalones'
], function (
	types,
	Parser,
	mustache,
	comment,
	element,
	text,
	trimWhitespace,
	stripStandalones
) {

	'use strict';

	var StandardParser,
		parse,
		contiguousWhitespace = /[ \t\f\r\n]+/g,
		inlinePartialStart = /<!--\s*\{\{\s*>\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/,
		inlinePartialEnd = /<!--\s*\{\{\s*\/\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\s*}\}\s*-->/,
		preserveWhitespaceElements = /^(?:pre|script|style|textarea)$/i,
		parseCompoundTemplate;

	StandardParser = Parser.extend({
		init: function ( str, options ) {
			// config
			this.delimiters = options.delimiters || [ '{{', '}}' ];
			this.tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ];

			this.interpolate = {
				script: !options.interpolate || options.interpolate.script !== false,
				style: !options.interpolate || options.interpolate.style !== false
			};

			if ( options.sanitize === true ) {
				options.sanitize = {
					// blacklist from https://code.google.com/p/google-caja/source/browse/trunk/src/com/google/caja/lang/html/html4-elements-whitelist.json
					elements: 'applet base basefont body frame frameset head html isindex link meta noframes noscript object param script style title'.split( ' ' ),
					eventAttributes: true
				};
			}

			this.sanitizeElements = options.sanitize && options.sanitize.elements;
			this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
			this.includeLinePositions = options.includeLinePositions;
			this.handlebars = options.handlebars;
		},

		postProcess: function ( items, options ) {

			cleanup( items, options.stripComments !== false, options.preserveWhitespace, options.rewriteElse !== false );

			if ( !options.preserveWhitespace ) {
				trimWhitespace( items );
			}

			return items;
		},

		converters: [
			mustache,
			comment,
			element,
			text
		]
	});

	parse = function ( template, options ) {
		var parser;

		options = options || {};

		// does this template include inline partials?
		if ( inlinePartialStart.test( template ) ) {
			return parseCompoundTemplate( template, options );
		}

		parser = new StandardParser( template, options );

		if ( parser.leftover ) {
			parser.error( 'Unexpected character' );
		}

		return parser.result;
	};

	parseCompoundTemplate = function ( template, options ) {
		var mainTemplate, remaining, partials, name, startMatch, endMatch;

		partials = {};

		mainTemplate = '';
		remaining = template;

		while ( startMatch = inlinePartialStart.exec( remaining ) ) {
			name = startMatch[1];

			mainTemplate += remaining.substr( 0, startMatch.index );
			remaining = remaining.substring( startMatch.index + startMatch[0].length );

			endMatch = inlinePartialEnd.exec( remaining );

			if ( !endMatch || endMatch[1] !== name ) {
				throw new Error( 'Inline partials must have a closing delimiter, and cannot be nested' );
			}

			partials[ name ] = parse( remaining.substr( 0, endMatch.index ), options );

			remaining = remaining.substring( endMatch.index + endMatch[0].length );
		}

		return {
			main: parse( mainTemplate, options ),
			partials: partials
		};
	};

	return parse;

	function cleanup ( items, stripComments, preserveWhitespace, rewriteElse ) {
		var i, item, preserveWhitespaceInsideElement, unlessBlock, key;

		// first pass - remove standalones
		stripStandalones( items );

		i = items.length;
		while ( i-- ) {
			item = items[i];
			// Remove delimiter changes, unsafe elements etc
			if ( item.exclude ) {
				items.splice( i, 1 );
			}

			// Remove comments, unless we want to keep them
			else if ( stripComments && item.t === types.COMMENT ) {
				items.splice( i, 1 );
			}

			// Recurse
			if ( item.f ) {
				preserveWhitespaceInsideElement = ( item.t === types.ELEMENT && preserveWhitespaceElements.test( item.e ) );

				cleanup( item.f, stripComments, preserveWhitespace || preserveWhitespaceInsideElement, rewriteElse );

				if ( !preserveWhitespace && item.t === types.ELEMENT ) {
					trimWhitespace( item.f );
				}
			}

			// Split if-else blocks into two (an if, and an unless)
			if ( item.l ) {
				cleanup( item.l, stripComments, preserveWhitespace, rewriteElse );

				if ( rewriteElse ) {

					unlessBlock = {
						t: 4,
						r: item.r,
						n: types.SECTION_UNLESS,
						f: item.l
					};

					items.splice( i + 1, 0, unlessBlock );
					delete item.l;
				}
			}

			// Clean up element attributes
			if ( item.a ) {
				for ( key in item.a ) {
					if ( item.a.hasOwnProperty( key ) && typeof item.a[ key ] !== 'string' ) {
						cleanup( item.a[ key ], stripComments, preserveWhitespace, rewriteElse );
					}
				}
			}
		}

		// final pass - fuse text nodes together
		i = items.length;
		while ( i-- ) {
			if ( typeof items[i] === 'string' ) {
				if ( typeof items[i+1] === 'string' ) {
					items[i] = items[i] + items[i+1];
					items.splice( i + 1, 1 );
				}

				if ( !preserveWhitespace ) {
					items[i] = items[i].replace( contiguousWhitespace, ' ' );
				}
			}
		}
	}

});
