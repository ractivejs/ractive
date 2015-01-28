import { COMMENT, ELEMENT, SECTION_IF } from 'config/types';
import Parser from './Parser/_Parser';
import mustache from './converters/mustache';
import comment from './converters/comment';
import element from './converters/element';
import partial from './converters/partial';
import text from './converters/text';
import trimWhitespace from './utils/trimWhitespace';
import stripStandalones from './utils/stripStandalones';
import processPartials from './converters/partial/processPartials';
import { isEmptyObject, isArray } from 'utils/is';

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
// * l - eLse fragment. Contains a template's children in the else cases
// * b - sibling Block count
// * e - Element name
// * a - map of element Attributes, or proxy event/transition Arguments
// * m - Mustache attributes (as in <div {{#if selected}}class="selected"{{/if}}>...</div>)
// * d - Dynamic proxy event/transition arguments
// * n - indicates section type
// * i - Index reference, e.g. 'num' in {{#section:num}}content{{/section}}
// * v - eVent proxies (i.e. when user e.g. clicks on a node, fire proxy event)
// * x - eXpressions
// * s - String representation of an expression function
// * t0 - intro/outro Transition
// * t1 - intro Transition
// * t2 - outro Transition
// * o - decOrator
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

		this.StandardParser = StandardParser;
	},

	postProcess: function ( items, options ) {
		if ( this.sectionDepth > 0 ) {
			this.error( 'A section was left open' );
		}

		cleanup( items, options.stripComments !== false, options.preserveWhitespace, !options.preserveWhitespace, !options.preserveWhitespace );

		return items;
	},

	converters: [
		partial,
		mustache,
		comment,
		element,
		text
	]
});

parse = function ( template, options = {} ) {
	var result;

	setDelimiters( options );

	result = {
		v: 3 // template spec version, defined in https://github.com/ractivejs/template-spec
	};

	result.t = new StandardParser( template, options ).result;

	// collect all of the partials and stick them on the appropriate instances
	let partials = {};
	// without a ractive instance, no components will be found
	processPartials( options.ractive ? [options.ractive] : [], partials, result.t );

	if ( !isEmptyObject( partials ) ) {
		result.p = partials;
	}

	return result;
};

export default parse;

function cleanup ( items, stripComments, preserveWhitespace, removeLeadingWhitespace, removeTrailingWhitespace ) {
	var i,
		item,
		previousItem,
		nextItem,
		preserveWhitespaceInsideFragment,
		removeLeadingWhitespaceInsideFragment,
		removeTrailingWhitespaceInsideFragment,
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
		else if ( stripComments && item.t === COMMENT ) {
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
			preserveWhitespaceInsideFragment = preserveWhitespace || ( item.t === ELEMENT && preserveWhitespaceElements.test( item.e ) );

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

			cleanup( item.f, stripComments, preserveWhitespaceInsideFragment, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
		}

		// Split if-else blocks into its bits
		if ( item.l ) {
			let blocks = item.l.map( l => {
				var block = {
					t: 4,
					n: SECTION_IF,
					f: l
				};

				cleanup( l, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );

				if ( l.expression  ) {
					block.x  = l.expression;
					delete l.expression;
				} else {
					block.x = { s: 'true', r: [] };
				}

				return block;
			});

			item.b = blocks.length;

			items.splice.apply( items, [ i + 1, 0 ].concat( blocks ) );
			delete item.l;
		}

		// Clean up element attributes
		if ( item.a ) {
			for ( key in item.a ) {
				if ( item.a.hasOwnProperty( key ) && typeof item.a[ key ] !== 'string' ) {
					cleanup( item.a[ key ], stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
				}
			}
		}

		// Clean up conditional attributes
		if ( item.m ) {
			cleanup( item.m, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
		}

		// Clean up event handlers
		if ( item.v ) {
			for ( key in item.v ) {
				if ( item.v.hasOwnProperty( key ) ) {
					// clean up names
					if ( isArray( item.v[ key ].n ) ) {
						cleanup( item.v[ key ].n, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
					}

					// clean up params
					if ( isArray( item.v[ key ].d ) ) {
						cleanup( item.v[ key ].d, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );
					}
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

function setDelimiters ( source, target ) {
	target = target || source;

	target.delimiters = source.delimiters || [ '{{', '}}' ];
	target.tripleDelimiters = source.tripleDelimiters || [ '{{{', '}}}' ];

	target.staticDelimiters = source.staticDelimiters || [ '[[', ']]' ];
	target.staticTripleDelimiters = source.staticTripleDelimiters || [ '[[[', ']]]' ];
}
