define([
	'config/types',
	'config/voidElementNames',
	'parse/converters/mustache',
	'parse/converters/comment',
	'parse/converters/text',
	'parse/converters/element/closingTag',
	'parse/converters/element/attribute',
	'parse/converters/element/processDirective'
], function (
	types,
	voidElementNames,
	getMustache,
	getComment,
	getText,
	getClosingTag,
	getAttribute,
	processDirective
) {

	'use strict';

	var tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/,
		validTagNameFollower = /^[\s\n\/>]/,
		onPattern = /^on/,
		proxyEventPattern = /^on-([a-zA-Z$_][a-zA-Z$_0-9]+)/,
		directives = { 'intro-outro': 't0', intro: 't1', outro: 't2', decorator: 'o' },
		exclude = { exclude: true },
		converters;

	// Different set of converters, because this time we're looking for closing tags
	converters = [
		getMustache,
		getComment,
		getElement,
		getText,
		getClosingTag
	];

	return getElement;

	function getElement ( parser ) {
		var start,
			startPos,
			element,
			lowerCaseName,
			directiveName,
			match,
			attribute,
			selfClosing,
			children,
			child;

		start = parser.pos;
		startPos = parser.getLinePos();

		if ( parser.inside ) {
			return null;
		}

		if ( !parser.matchString( '<' ) ) {
			return null;
		}

		// if this is a closing tag, abort straight away
		if ( parser.nextChar() === '/' ) {
			return null;
		}

		element = {
			t: types.ELEMENT
		};

		if ( parser.includeLinePositions ) {
			element.p = startPos.toJSON();
		}

		if ( parser.matchString( '!' ) ) {
			element.y = 1;
		}

		// element name
		element.e = parser.matchPattern( tagNamePattern );
		if ( !element.e ) {
			return null;
		}

		// next character must be whitespace, closing solidus or '>'
		if ( !validTagNameFollower.test( parser.nextChar() ) ) {
			parser.error( 'Illegal tag name' );
		}

		// directives and attributes
		while ( attribute = getAttribute( parser ) ) {
			// intro, outro, decorator
			if ( directiveName = directives[ attribute.name ] ) {
				element[ directiveName ] = processDirective( attribute.value );
			}

			// on-click etc
			else if ( match = proxyEventPattern.exec( attribute.name ) ) {
				if ( !element.v ) element.v = {};
				element.v[ match[1] ] = processDirective( attribute.value );
			}

			else {
				if ( !parser.sanitizeEventAttributes || !onPattern.test( attribute.name ) ) {
					if ( !element.a ) element.a = {};
					element.a[ attribute.name ] = attribute.value || 0;
				}
			}
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
			while ( child = parser.read( converters ) ) {
				// Special case - closing section tag
				if ( child.t === types.CLOSING ) {
					break;
				}

				if ( child.t === types.CLOSING_TAG ) {
					break;

					// TODO verify that this tag can close this element (is either the same, or
					// a parent that can close child elements implicitly)

					//parser.error( 'Expected closing </' + element.e + '> tag' );
				}

				children.push( child );

				// TODO handle sibling elements that close blocks

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


});
