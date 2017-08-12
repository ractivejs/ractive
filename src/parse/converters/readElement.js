import { ANCHOR, DOCTYPE, ELEMENT } from '../../config/types';
import { voidElementNames } from '../../utils/html';
import { READERS, PARTIAL_READERS } from '../_parse';
import cleanup from '../utils/cleanup';
import readMustache from './readMustache';
import readClosingTag from './element/readClosingTag';
import readClosing from './mustache/section/readClosing';
import readElse from './mustache/section/readElse';
import readElseIf from './mustache/section/readElseIf';

const tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/;
const anchorPattern = /^[a-zA-Z_$][-a-zA-Z0-9_$]*/;
const validTagNameFollower = /^[\s\n\/>]/;
const exclude = { exclude: true };

// based on http://developers.whatwg.org/syntax.html#syntax-tag-omission
const disallowedContents = {
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

export default readElement;

function readElement ( parser ) {
	let attribute, selfClosing, children, partials, hasPartials, child, closed, pos, remaining, closingTag, anchor;

	const start = parser.pos;

	if ( parser.inside || parser.inAttribute || parser.textOnlyMode ) {
		return null;
	}

	if ( !parser.matchString( '<' ) ) {
		return null;
	}

	// if this is a closing tag, abort straight away
	if ( parser.nextChar() === '/' ) {
		return null;
	}

	const element = {};
	if ( parser.includeLinePositions ) {
		element.p = parser.getLinePos( start );
	}

	// check for doctype decl
	if ( parser.matchString( '!' ) ) {
		element.t = DOCTYPE;
		if ( !parser.matchPattern( /^doctype/i ) ) {
			parser.error( 'Expected DOCTYPE declaration' );
		}

		element.a = parser.matchPattern( /^(.+?)>/ );
		return element;
	}
	// check for anchor
	else if ( anchor = parser.matchString( '#' ) ) {
		parser.allowWhitespace();
		element.t = ANCHOR;
		element.n = parser.matchPattern( anchorPattern );
	}
	// otherwise, it's an element/component
	else {
		element.t = ELEMENT;

		// element name
		element.e = parser.matchPattern( tagNamePattern );
		if ( !element.e ) {
			return null;
		}
	}

	// next character must be whitespace, closing solidus or '>'
	if ( !validTagNameFollower.test( parser.nextChar() ) ) {
		parser.error( 'Illegal tag name' );
	}

	parser.allowWhitespace();

	parser.inTag = true;

	// directives and attributes
	while ( attribute = readMustache( parser ) ) {
		if ( attribute !== false ) {
			if ( !element.m ) element.m = [];
			element.m.push( attribute );
		}

		parser.allowWhitespace();
	}

	parser.inTag = false;

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

	const lowerCaseName = ( element.e || element.n ).toLowerCase();
	const preserveWhitespace = parser.preserveWhitespace;

	if ( !selfClosing && ( anchor || !voidElementNames.test( element.e ) ) ) {
		if ( !anchor ) {
			parser.elementStack.push( lowerCaseName );

			// Special case - if we open a script element, further tags should
			// be ignored unless they're a closing script element
			if ( lowerCaseName in parser.interpolate ) {
				parser.inside = lowerCaseName;
			}
		}

		children = [];
		partials = Object.create( null );

		do {
			pos = parser.pos;
			remaining = parser.remaining();

			if ( !remaining ) {
				parser.error( `Missing end ${
					parser.elementStack.length > 1 ? 'tags' : 'tag'
				} (${
					parser.elementStack.reverse().map( x => `</${x}>` ).join( '' )
				})` );
			}

			// if for example we're in an <li> element, and we see another
			// <li> tag, close the first so they become siblings
			if ( !anchor && !canContain( lowerCaseName, remaining ) ) {
				closed = true;
			}

			// closing tag
			else if ( !anchor && ( closingTag = readClosingTag( parser ) ) ) {
				closed = true;

				const closingTagName = closingTag.e.toLowerCase();

				// if this *isn't* the closing tag for the current element...
				if ( closingTagName !== lowerCaseName ) {
					// rewind parser
					parser.pos = pos;

					// if it doesn't close a parent tag, error
					if ( !~parser.elementStack.indexOf( closingTagName ) ) {
						let errorMessage = 'Unexpected closing tag';

						// add additional help for void elements, since component names
						// might clash with them
						if ( voidElementNames.test( closingTagName ) ) {
							errorMessage += ` (<${closingTagName}> is a void element - it cannot contain children)`;
						}

						parser.error( errorMessage );
					}
				}
			}

			else if ( anchor && readAnchorClose( parser, element.n ) ) {
				closed = true;
			}

			else {
				// implicit close by closing section tag. TODO clean this up
				const tag = { open: parser.standardDelimiters[0], close: parser.standardDelimiters[1] };
				const implicitCloseCase = [ readClosing, readElseIf, readElse ];
				if (  implicitCloseCase.some( r => r( parser, tag ) ) ) {
					closed = true;
					parser.pos = pos;
				}

				else if ( child = parser.read( PARTIAL_READERS ) ) {
					if ( partials[ child.n ] ) {
						parser.pos = pos;
						parser.error( 'Duplicate partial definition' );
					}

					cleanup( child.f, parser.stripComments, preserveWhitespace, !preserveWhitespace, !preserveWhitespace );

					partials[ child.n ] = child.f;
					hasPartials = true;
				}

				else {
					if ( child = parser.read( READERS ) ) {
						children.push( child );
					} else {
						closed = true;
					}
				}
			}
		} while ( !closed );

		if ( children.length ) {
			element.f = children;
		}

		if ( hasPartials ) {
			element.p = partials;
		}

		parser.elementStack.pop();
	}

	parser.inside = null;

	if ( parser.sanitizeElements && parser.sanitizeElements.indexOf( lowerCaseName ) !== -1 ) {
		return exclude;
	}

	return element;
}

function canContain ( name, remaining ) {
	const match = /^<([a-zA-Z][a-zA-Z0-9]*)/.exec( remaining );
	const disallowed = disallowedContents[ name ];

	if ( !match || !disallowed ) {
		return true;
	}

	return !~disallowed.indexOf( match[1].toLowerCase() );
}

function readAnchorClose ( parser, name ) {
	const pos = parser.pos;
	if ( !parser.matchString( '</' ) ) {
		return null;
	}

	parser.matchString( '#' );
	parser.allowWhitespace();

	if ( !parser.matchString( name ) ) {
		parser.pos = pos;
		return null;
	}

	parser.allowWhitespace();

	if ( !parser.matchString( '>' ) ) {
		parser.pos = pos;
		return null;
	}

	return true;
}
