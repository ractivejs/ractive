import { DOCTYPE, ELEMENT, CLOSING, CLOSING_TAG } from 'config/types';
import { voidElementNames } from 'utils/html';
import getMustache from './mustache';
import getComment from './comment';
import getPartial from './partial';
import getText from './text';
import getClosingTag from './element/closingTag';
import getAttribute from './element/attribute';
import processDirective from './element/processDirective';

var tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/,
	validTagNameFollower = /^[\s\n\/>]/,
	onPattern = /^on/,
	proxyEventPattern = /^on-([a-zA-Z\\*\\.$_][a-zA-Z\\*\\.$_0-9\-]+)$/,
	reservedEventNames = /^(?:change|reset|teardown|update|construct|config|init|render|unrender|detach|insert)$/,
	directives = { 'intro-outro': 't0', intro: 't1', outro: 't2', decorator: 'o' },
	exclude = { exclude: true },
	converters,
	disallowedContents;

// Different set of converters, because this time we're looking for closing tags
converters = [
	getPartial,
	getMustache,
	getComment,
	getElement,
	getText,
	getClosingTag
];

// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
disallowedContents = {
	li: [ 'li' ],
	dt: [ 'dt', 'dd' ],
	dd: [ 'dt', 'dd' ],
	p: 'address article aside blockquote div dl fieldset footer form h1 h2 h3 h4 h5 h6 header hgroup hr main menu nav ol p pre section table ul'.split( ' ' ),
	rt: [ 'rt', 'rp' ],
	rp: [ 'rt', 'rp' ],
	optgroup: [ 'optgroup' ],
	option: [ 'option', 'optgroup' ],
	thead: [ 'tbody', 'tfoot' ],
	tbody: [ 'tbody', 'tfoot' ],
	tfoot: [ 'tbody' ],
	tr: [ 'tr', 'tbody' ],
	td: [ 'td', 'th', 'tr' ],
	th: [ 'td', 'th', 'tr' ]
};

export default getElement;

function getElement ( parser ) {
	var start,
		element,
		lowerCaseName,
		directiveName,
		match,
		addProxyEvent,
		attribute,
		directive,
		selfClosing,
		children,
		child;

	start = parser.pos;

	if ( parser.inside || parser.inAttribute ) {
		return null;
	}

	if ( !parser.matchString( '<' ) ) {
		return null;
	}

	// if this is a closing tag, abort straight away
	if ( parser.nextChar() === '/' ) {
		return null;
	}

	element = {};
	if ( parser.includeLinePositions ) {
		element.p = parser.getLinePos( start );
	}

	if ( parser.matchString( '!' ) ) {
		element.t = DOCTYPE;
		if ( !parser.matchPattern( /^doctype/i ) ) {
			parser.error( 'Expected DOCTYPE declaration' );
		}

		element.a = parser.matchPattern( /^(.+?)>/ );
		return element;
	}

	element.t = ELEMENT;

	// element name
	element.e = parser.matchPattern( tagNamePattern );
	if ( !element.e ) {
		return null;
	}

	// next character must be whitespace, closing solidus or '>'
	if ( !validTagNameFollower.test( parser.nextChar() ) ) {
		parser.error( 'Illegal tag name' );
	}

	addProxyEvent = function ( name, directive ) {
		var directiveName = directive.n || directive;

		if ( reservedEventNames.test( directiveName ) ) {
			parser.pos -= directiveName.length;
			parser.error( 'Cannot use reserved event names (change, reset, teardown, update, construct, config, init, render, unrender, detach, insert)' );
		}

		element.v[ name ] = directive;
	};

	parser.allowWhitespace();

	// directives and attributes
	while ( attribute = getMustache( parser ) || getAttribute( parser ) ) {
		// regular attributes
		if ( attribute.name ) {
			// intro, outro, decorator
			if ( directiveName = directives[ attribute.name ] ) {
				element[ directiveName ] = processDirective( attribute.value );
			}

			// on-click etc
			else if ( match = proxyEventPattern.exec( attribute.name ) ) {
				if ( !element.v ) element.v = {};
				directive = processDirective( attribute.value );
				addProxyEvent( match[1], directive );
			}

			else {
				if ( !parser.sanitizeEventAttributes || !onPattern.test( attribute.name ) ) {
					if ( !element.a ) element.a = {};
					element.a[ attribute.name ] = attribute.value || 0;
				}
			}
		}

		// {{#if foo}}class='foo'{{/if}}
		else {
			if ( !element.m ) element.m = [];
			element.m.push( attribute );
		}

		parser.allowWhitespace();
	}

	// allow whitespace before closing solidus
	parser.allowWhitespace();

	// self-closing solidus?
	if ( parser.matchString( '/' ) ) {
		selfClosing = true;
	}

	// closing angle bracket
	if ( !parser.matchString( '>' ) ) {
		return null;
	}

	lowerCaseName = element.e.toLowerCase();

	if ( !selfClosing && !voidElementNames.test( element.e ) ) {
		// Special case - if we open a script element, further tags should
		// be ignored unless they're a closing script element
		if ( lowerCaseName === 'script' || lowerCaseName === 'style' ) {
			parser.inside = lowerCaseName;
		}

		children = [];
		while ( canContain( lowerCaseName, parser.remaining() ) && ( child = parser.read( converters ) ) ) {
			// Special case - closing section tag
			if ( child.t === CLOSING ) {
				break;
			}

			if ( child.t === CLOSING_TAG ) {
				break;

				// TODO verify that this tag can close this element (is either the same, or
				// a parent that can close child elements implicitly)

				//parser.error( 'Expected closing </' + element.e + '> tag' );
			}

			children.push( child );
		}

		if ( children.length ) {
			element.f = children;
		}
	}

	parser.inside = null;

	if ( parser.sanitizeElements && parser.sanitizeElements.indexOf( lowerCaseName ) !== -1 ) {
		return exclude;
	}

	return element;
}

function canContain ( name, remaining ) {
	var match, disallowed;

	match = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec( remaining );
	disallowed = disallowedContents[ name ];

	if ( !match || !disallowed ) {
		return true;
	}

	return !~disallowed.indexOf( match[1].toLowerCase() );
}
