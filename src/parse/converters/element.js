define([
	'config/types',
	'config/voidElementNames',
	'parse/converters/element/attribute',
	'parse/converters/element/processDirective',
	'parse/Parser/utils/trimWhitespace'
], function (
	types,
	voidElementNames,
	getAttribute,
	processDirective,
	trimWhitespace
) {

	'use strict';

	var tagNamePattern = /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/,
		attributeNamePattern = /^[^\s"'>\/=]+/,
		unquotedAttributeValueTextPattern = /^[^\s"'=<>`]+/,
		onPattern = /^on/,
		closingTagPatterns = {},
		directives = { intro: 't1', outro: 't2', decorator: 'o' };

	return function getElement ( parser ) {
		var start,
			element,
			attrs,
			lowerCaseName,
			directiveName,
			attribute,
			selfClosing,
			isVoid,
			children,
			child,
			closingTagPattern;

		start = parser.pos;

		if ( parser.inside ) {
			return null;
		}

		if ( !parser.matchString( '<' ) ) {
			return null;
		}

		element = {
			t: types.ELEMENT
		};

		if ( parser.matchString( '!' ) ) {
			element.y = 1;
		}

		// element name
		element.e = parser.matchPattern( tagNamePattern );
		if ( !element.e ) {
			return null;
		}

		// directives and attributes
		while ( attribute = getAttribute( parser ) ) {
			if ( directiveName = directives[ attribute.name ] ) {
				element[ directiveName ] = processDirective( attribute.value );
			} else {
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
			while ( child = parser.read() ) {
				if ( !child.ignore ) {
					children.push( child );
				}
				// TODO handle sibling elements that close blocks
			}

			if ( children.length ) {
				if ( !parser.preserveWhitespace ) {
					trimWhitespace( children );
				}
				element.f = children;
			}

			closingTagPattern = getClosingTagPattern( lowerCaseName );

			if ( !parser.matchPattern( closingTagPattern ) ) {
				return null;
			}
		}

		if ( parser.sanitizeElements && parser.sanitizeElements.indexOf( lowerCaseName ) !== -1 ) {
			return { ignore: true };
		}

		return element;
	};

	function getClosingTagPattern ( name ) {
		if ( !closingTagPatterns[ name ] ) {
			closingTagPatterns[ name ] = new RegExp( '^<\\/' + name + '\\s*>', 'i' );
		}

		return closingTagPatterns[ name ];
	}

	function getAttributes ( parser ) {
		var start, attributes, hasAttributes, attribute;

		start = parser.pos;

		// if the next character isn't whitespace, there are no attributes...
		if ( !parser.matchString( ' ' ) && !parser.matchString( '\n' ) ) {
			return null;
		}

		attribute = getAttribute( parser );

		if ( !attribute ) {
			return null;
		}

		attributes = {};

		do {
			if ( parser.sanitizeEventAttributes && onPattern.test( attribute.name ) ) {
				continue;
			}

			hasAttributes = true;
			attributes[ attribute.name ] = attribute.value || 0;
		} while ( attribute = getAttribute( parser ) )

		if ( hasAttributes ) {
			return attributes;
		}
	}


});
