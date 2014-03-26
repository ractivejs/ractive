define([
	'config/types',
	'parse/Tokenizer/utils/makeRegexMatcher',
	'parse/Tokenizer/utils/getLowestIndex'
], function (
	types,
	makeRegexMatcher,
	getLowestIndex
) {

	'use strict';

	var getTag,

		getOpeningTag,
		getClosingTag,
		getTagName,
		getAttributes,
		getAttribute,
		getAttributeName,
		getAttributeValue,
		getUnquotedAttributeValue,
		getUnquotedAttributeValueToken,
		getUnquotedAttributeValueText,
		getQuotedStringToken,
		getQuotedAttributeValue;

	getTag = function () {
		return getOpeningTag( this ) || getClosingTag( this );
	};

	getOpeningTag = function ( tokenizer ) {
		var start, tag, attrs, lowerCaseName;

		start = tokenizer.pos;

		if ( tokenizer.inside ) {
			return null;
		}

		if ( !tokenizer.getStringMatch( '<' ) ) {
			return null;
		}

		tag = {
			type: types.TAG
		};

		if ( tokenizer.getStringMatch( '!' ) ) {
			tag.doctype = true;
		}

		// tag name
		tag.name = getTagName( tokenizer );
		if ( !tag.name ) {
			tokenizer.pos = start;
			return null;
		}

		// attributes
		attrs = getAttributes( tokenizer );
		if ( attrs ) {
			tag.attrs = attrs;
		}

		// allow whitespace before closing solidus
		tokenizer.allowWhitespace();

		// self-closing solidus?
		if ( tokenizer.getStringMatch( '/' ) ) {
			tag.selfClosing = true;
		}

		// closing angle bracket
		if ( !tokenizer.getStringMatch( '>' ) ) {
			tokenizer.pos = start;
			return null;
		}

		// Special case - if we open a script tag, further tags should
		// be ignored unless they're a closing script tag
		lowerCaseName = tag.name.toLowerCase();
		if ( lowerCaseName === 'script' || lowerCaseName === 'style' ) {
			tokenizer.inside = lowerCaseName;
		}

		return tag;
	};

	getClosingTag = function ( tokenizer ) {
		var start, tag, expected;

		start = tokenizer.pos;

		expected = function ( str ) {
			throw new Error( 'Unexpected character ' + tokenizer.remaining().charAt( 0 ) + ' (expected ' + str + ')' );
		};

		if ( !tokenizer.getStringMatch( '<' ) ) {
			return null;
		}

		tag = { type: types.TAG, closing: true };

		// closing solidus
		if ( !tokenizer.getStringMatch( '/' ) ) {
			expected( '"/"' );
		}

		// tag name
		tag.name = getTagName( tokenizer );
		if ( !tag.name ) {
			expected( 'tag name' );
		}

		// closing angle bracket
		if ( !tokenizer.getStringMatch( '>' ) ) {
			expected( '">"' );
		}

		if ( tokenizer.inside ) {
			if ( tag.name.toLowerCase() !== tokenizer.inside ) {
				tokenizer.pos = start;
				return null;
			}

			tokenizer.inside = null;
		}

		return tag;
	};

	getTagName = makeRegexMatcher( /^[a-zA-Z]{1,}:?[a-zA-Z0-9\-]*/ );

	getAttributes = function ( tokenizer ) {
		var start, attrs, attr;

		start = tokenizer.pos;

		// if the next character isn't whitespace, there are no attributes...
		if ( !tokenizer.getStringMatch( ' ' ) ) {
			return null;
		}

		// ...but allow arbitrary amounts of whitespace
		tokenizer.allowWhitespace();

		attr = getAttribute( tokenizer );

		if ( !attr ) {
			tokenizer.pos = start;
			return null;
		}

		attrs = [];

		while ( attr !== null ) {
			attrs.push( attr );

			tokenizer.allowWhitespace();
			attr = getAttribute( tokenizer );
		}

		return attrs;
	};

	getAttribute = function ( tokenizer ) {
		var attr, name, value;

		name = getAttributeName( tokenizer );
		if ( !name ) {
			return null;
		}

		attr = {
			name: name
		};

		value = getAttributeValue( tokenizer );
		if ( value ) {
			attr.value = value;
		}

		return attr;
	};

	getAttributeName = makeRegexMatcher( /^[^\s"'>\/=]+/ );



	getAttributeValue = function ( tokenizer ) {
		var start, value;

		start = tokenizer.pos;

		tokenizer.allowWhitespace();

		if ( !tokenizer.getStringMatch( '=' ) ) {
			tokenizer.pos = start;
			return null;
		}

		tokenizer.allowWhitespace();

		value = getQuotedAttributeValue( tokenizer, "'" ) ||
		        getQuotedAttributeValue( tokenizer, '"' ) ||
		        getUnquotedAttributeValue( tokenizer );

		if ( value === null ) {
			tokenizer.pos = start;
			return null;
		}

		return value;
	};

	getUnquotedAttributeValueText = makeRegexMatcher( /^[^\s"'=<>`]+/ );

	getUnquotedAttributeValueToken = function ( tokenizer ) {
		var start, text, index;

		start = tokenizer.pos;

		text = getUnquotedAttributeValueText( tokenizer );

		if ( !text ) {
			return null;
		}

		if ( ( index = text.indexOf( tokenizer.delimiters[0] ) ) !== -1 ) {
			text = text.substr( 0, index );
			tokenizer.pos = start + text.length;
		}

		return {
			type: types.TEXT,
			value: text
		};
	};

	getUnquotedAttributeValue = function ( tokenizer ) {
		var tokens, token;

		tokens = [];

		token = tokenizer.getMustache() || getUnquotedAttributeValueToken( tokenizer );
		while ( token !== null ) {
			tokens.push( token );
			token = tokenizer.getMustache() || getUnquotedAttributeValueToken( tokenizer );
		}

		if ( !tokens.length ) {
			return null;
		}

		return tokens;
	};

	getQuotedAttributeValue = function ( tokenizer, quoteMark ) {
		var start, tokens, token;

		start = tokenizer.pos;

		if ( !tokenizer.getStringMatch( quoteMark ) ) {
			return null;
		}

		tokens = [];

		token = tokenizer.getMustache() || getQuotedStringToken( tokenizer, quoteMark );
		while ( token !== null ) {
			tokens.push( token );
			token = tokenizer.getMustache() || getQuotedStringToken( tokenizer, quoteMark );
		}

		if ( !tokenizer.getStringMatch( quoteMark ) ) {
			tokenizer.pos = start;
			return null;
		}

		return tokens;
	};

	getQuotedStringToken = function ( tokenizer, quoteMark ) {
		var start, index, remaining;

		start = tokenizer.pos;
		remaining = tokenizer.remaining();

		index = getLowestIndex( remaining, [ quoteMark, tokenizer.delimiters[0], tokenizer.delimiters[1] ] );

		if ( index === -1 ) {
			throw new Error( 'Quoted attribute value must have a closing quote' );
		}

		if ( !index ) {
			return null;
		}

		tokenizer.pos += index;

		return {
			type: types.TEXT,
			value: remaining.substr( 0, index )
		};
	};

	return getTag;

});
