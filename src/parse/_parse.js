import types from 'config/types';
import Parser from 'parse/Parser/_Parser';
import mustache from 'parse/converters/mustache';
import comment from 'parse/converters/comment';
import element from 'parse/converters/element';
import text from 'parse/converters/text';
import trimWhitespace from 'parse/utils/trimWhitespace';
import stripStandalones from 'parse/utils/stripStandalones';
import escapeRegExp from 'utils/escapeRegExp';

// Ractive.parse
// ===============
//
// Takes in a string, and returns an object representing the parsed template.
// A parsed template is an array of 1 or more 'templates', which in some
// cases have children.
//
// The format is optimised for size, not readability, however for reference the
// keys for each template are as follows:
//
// * r - Reference, e.g. 'mustache' in {{mustache}}
// * t - Type code (e.g. 1 is text, 2 is interpolator...)
// * f - Fragment. Contains a template's children
// * l - eLse fragment. Contains a template's children in the else case
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


var StandardParser,
	parse,
	contiguousWhitespace = /[ \t\f\r\n]+/g,
	preserveWhitespaceElements = /^(?:pre|script|style|textarea)$/i,
	leadingWhitespace = /^\s+/,
	trailingWhitespace = /\s+$/;

StandardParser = Parser.extend({
	init: function ( str, options ) {
		// config
		setDelimiters( options, this );

		this.sectionDepth = 0;

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
	},

	postProcess: function ( items, options ) {
		if ( this.sectionDepth > 0 ) {
			this.error( 'A section was left open' );
		}

		cleanup( items, options.stripComments !== false, options.preserveWhitespace, !options.preserveWhitespace, !options.preserveWhitespace, options.rewriteElse !== false );
		return items;
	},

	converters: [
		mustache,
		comment,
		element,
		text
	]
});

parse = function ( template, options = {} ) {
	var result, remaining, partials, name, startMatch, endMatch, inlinePartialStart, inlinePartialEnd;

	setDelimiters(options);

	inlinePartialStart = new RegExp('<!--\\s*' + escapeRegExp(options.delimiters[0]) + '\\s*>\\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\\s*' + escapeRegExp(options.delimiters[1]) + '\\s*-->');
	inlinePartialEnd = new RegExp('<!--\\s*' + escapeRegExp(options.delimiters[0]) + '\\s*\\/\\s*([a-zA-Z_$][a-zA-Z_$0-9]*)\\s*' + escapeRegExp(options.delimiters[1]) + '\\s*-->');

	result = {
		v: 1 // template spec version, defined in https://github.com/ractivejs/template-spec
	};

	if ( inlinePartialStart.test( template ) ) {
		remaining = template;
		template = '';

		while ( startMatch = inlinePartialStart.exec( remaining ) ) {
			name = startMatch[1];

			template += remaining.substr( 0, startMatch.index );
			remaining = remaining.substring( startMatch.index + startMatch[0].length );

			endMatch = inlinePartialEnd.exec( remaining );

			if ( !endMatch || endMatch[1] !== name ) {
				throw new Error( 'Inline partials must have a closing delimiter, and cannot be nested. Expected closing for "' + name +
					'", but ' + ( endMatch ? 'instead found "' + endMatch[1] + '"' : ' no closing found' ) );
			}

			( partials || ( partials = {} ) )[ name ] = new StandardParser( remaining.substr( 0, endMatch.index ), options ).result;
			remaining = remaining.substring( endMatch.index + endMatch[0].length );
		}

		template += remaining;
		result.p = partials;
	}

	result.t = new StandardParser( template, options ).result;
	return result;
};

export default parse;

function cleanup ( items, stripComments, preserveWhitespace, removeLeadingWhitespace, removeTrailingWhitespace, rewriteElse ) {
	var i,
		item,
		previousItem,
		nextItem,
		preserveWhitespaceInsideFragment,
		removeLeadingWhitespaceInsideFragment,
		removeTrailingWhitespaceInsideFragment,
		unlessBlock,
		key;

	// First pass - remove standalones and comments etc
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
	}

	// If necessary, remove leading and trailing whitespace
	trimWhitespace( items, removeLeadingWhitespace, removeTrailingWhitespace );

	i = items.length;
	while ( i-- ) {
		item = items[i];

		// Recurse
		if ( item.f ) {
			preserveWhitespaceInsideFragment = preserveWhitespace || ( item.t === types.ELEMENT && preserveWhitespaceElements.test( item.e ) );

			if ( !preserveWhitespaceInsideFragment ) {
				previousItem = items[ i - 1 ];
				nextItem = items[ i + 1 ];

				// if the previous item was a text item with trailing whitespace,
				// remove leading whitespace inside the fragment
				if ( !previousItem || ( typeof previousItem === 'string' && trailingWhitespace.test( previousItem ) ) ) {
					removeLeadingWhitespaceInsideFragment = true;
				}

				// and vice versa
				if ( !nextItem || ( typeof nextItem === 'string' && leadingWhitespace.test( nextItem ) ) ) {
					removeTrailingWhitespaceInsideFragment = true;
				}
			}

			cleanup( item.f, stripComments, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment, rewriteElse );

			// Split if-else blocks into two (an if, and an unless)
			if ( item.l ) {
				cleanup( item.l, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment, rewriteElse );

				if ( rewriteElse ) {
					unlessBlock = {
						t: 4,
						n: types.SECTION_UNLESS,
						f: item.l
					};
					// copy the conditional based on its type
					if( item.r  ) { unlessBlock.r  = item.r;  }
					if( item.x  ) { unlessBlock.x  = item.x;  }
					if( item.rx ) { unlessBlock.rx = item.rx; }

					items.splice( i + 1, 0, unlessBlock );
					delete item.l;
				}
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

			if ( items[i] === '' ) {
				items.splice( i, 1 );
			}
		}
	}
}

function setDelimiters ( source, target = source ) {
	target.delimiters = source.delimiters || [ '{{', '}}' ];
	target.tripleDelimiters = source.tripleDelimiters || [ '{{{', '}}}' ];

	target.staticDelimiters = source.staticDelimiters || [ '[[', ']]' ];
	target.staticTripleDelimiters = source.staticTripleDelimiters || [ '[[[', ']]]' ];
}
