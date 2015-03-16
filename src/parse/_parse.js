import { TEMPLATE_VERSION } from 'config/template';
import Parser from './Parser';
import readMustache from './converters/readMustache';
import readTriple from './converters/mustache/readTriple';
import readUnescaped from './converters/mustache/readUnescaped';
import readPartial from './converters/mustache/readPartial';
import readMustacheComment from './converters/mustache/readMustacheComment';
import readInterpolator from './converters/mustache/readInterpolator';
import readYielder from './converters/mustache/readYielder';
import readSection from './converters/mustache/readSection';
import readHtmlComment from './converters/readHtmlComment';
import readElement from './converters/readElement';
import readText from './converters/readText';
import readPartialDefinitionComment from './converters/readPartialDefinitionComment';
import readPartialDefinitionSection from './converters/readPartialDefinitionSection';
import readTemplate from './converters/readTemplate';
import cleanup from './utils/cleanup';

// See https://github.com/ractivejs/template-spec for information
// about the Ractive template specification

let STANDARD_READERS = [ readPartial, readUnescaped, readSection, readYielder, readInterpolator, readMustacheComment ];
let TRIPLE_READERS = [ readTriple ];
let STATIC_READERS = [ readUnescaped, readSection, readInterpolator ]; // TODO does it make sense to have a static section?

let StandardParser;

export default function parse ( template, options ) {
	return new StandardParser( template, options || {} ).result;
}

export const READERS = [ readMustache, readHtmlComment, readElement, readText ];
export const PARTIAL_READERS = [ readPartialDefinitionComment, readPartialDefinitionSection ];

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

		this.stripComments = options.stripComments !== false;
		this.preserveWhitespace = options.preserveWhitespace;
		this.sanitizeElements = options.sanitize && options.sanitize.elements;
		this.sanitizeEventAttributes = options.sanitize && options.sanitize.eventAttributes;
		this.includeLinePositions = options.includeLinePositions;
	},

	postProcess ( result ) {
		// special case - empty string
		if ( !result.length ) {
			return { t: [], v: TEMPLATE_VERSION };
		}

		if ( this.sectionDepth > 0 ) {
			this.error( 'A section was left open' );
		}

		cleanup( result[0].t, this.stripComments, this.preserveWhitespace, !this.preserveWhitespace, !this.preserveWhitespace );

		return result[0];
	},

	converters: [
		readTemplate
	],

	sortMustacheTags () {
		// Sort in order of descending opening delimiter length (longer first),
		// to protect against opening delimiters being substrings of each other
		this.tags.sort( ( a, b ) => {
			return b.open.length - a.open.length;
		});
	}
});
