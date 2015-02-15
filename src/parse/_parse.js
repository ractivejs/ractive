import { TEMPLATE_VERSION } from 'config/template';
import { COMMENT, ELEMENT } from 'config/types';
import Parser from './Parser';
import readMustache from './converters/readMustache';
import readTriple from './converters/mustache/readTriple';
import readUnescaped from './converters/mustache/readUnescaped';
import readPartial from './converters/mustache/readPartial';
import readMustacheComment from './converters/mustache/readMustacheComment';
import readInterpolator from './converters/mustache/readInterpolator';
import readYielder from './converters/mustache/readYielder';
import readPartialDefinitionSection from './converters/mustache/readPartialDefinitionSection';
import readSection from './converters/mustache/readSection';
import readHtmlComment from './converters/readHtmlComment';
import readElement from './converters/readElement';
import readPartialDefinitionComment from './converters/readPartialDefinitionComment';
import readText from './converters/readText';
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
// * l - eLse fragment. Contains a template's children in the else case
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
	trailingWhitespace = /\s+$/,

	STANDARD_READERS = [ readPartial, readUnescaped, readPartialDefinitionSection, readSection, readYielder, readInterpolator, readMustacheComment ],
	TRIPLE_READERS = [ readTriple ],
	STATIC_READERS = [ readUnescaped, readSection, readInterpolator ]; // TODO does it make sense to have a static section?

StandardParser = Parser.extend({
	init ( str, options ) {
		var tripleDelimiters = options.tripleDelimiters || [ '{{{', '}}}' ],
			staticDelimiters = options.staticDelimiters || [ '[[', ']]' ],
			staticTripleDelimiters = options.staticTripleDelimiters || [ '[[[', ']]]' ];

		this.standardDelimiters = options.delimiters || [ '{{', '}}' ];

		this.tags = [
			{ isStatic: false, isTriple: false, open: this.standardDelimiters[0], close: this.standardDelimiters[1], readers: STANDARD_READERS },
			{ isStatic: false, isTriple: true,  open: tripleDelimiters[0],        close: tripleDelimiters[1],        readers: TRIPLE_READERS },
			{ isStatic: true,  isTriple: false, open: staticDelimiters[0],        close: staticDelimiters[1],        readers: STATIC_READERS },
			{ isStatic: true,  isTriple: true,  open: staticTripleDelimiters[0],  close: staticTripleDelimiters[1],  readers: TRIPLE_READERS }
		];

		this.sortMustacheTags();

		this.sectionDepth = 0;
		this.elementStack = [];

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

	postProcess ( items, options ) {
		if ( this.sectionDepth > 0 ) {
			this.error( 'A section was left open' );
		}

		cleanup( items, options.stripComments !== false, options.preserveWhitespace, !options.preserveWhitespace, !options.preserveWhitespace );

		return items;
	},

	converters: [
		readMustache,
		readPartialDefinitionComment,
		readHtmlComment,
		readElement,
		readText
	],

	sortMustacheTags () {
		// Sort in order of descending opening delimiter length (longer first),
		// to protect against opening delimiters being substrings of each other
		this.tags.sort( ( a, b ) => {
			return b.open.length - a.open.length;
		});
	}
});

parse = function ( template, options = {} ) {
	var parser, result;

	parser = new StandardParser( template, options );

	// if we're left with non-whitespace content, it means we
	// failed to parse some stuff
	if ( /\S/.test( parser.leftover ) ) {
		parser.error( 'Unexpected template content' );
	}

	result = {
		v: TEMPLATE_VERSION, // template spec version, defined in https://github.com/ractivejs/template-spec
		t: parser.result
	};

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

		// Split if-else blocks into two (an if, and an unless)
		if ( item.l ) {
			cleanup( item.l.f, stripComments, preserveWhitespace, removeLeadingWhitespaceInsideFragment, removeTrailingWhitespaceInsideFragment );

			items.splice( i + 1, 0, item.l );
			delete item.l; // TODO would be nice if there was a way around this
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
