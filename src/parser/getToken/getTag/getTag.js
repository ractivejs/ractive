var getTag;

(function () {
	var getOpeningTag,
	getClosingTag,
	getTagName,
	getAttributes,
	getAttribute,
	getAttributeName,
	getAttributeValue,
	getUnquotedAttributeValue,
	getUnquotedAttributeValueToken,
	getUnquotedAttributeValueText,
	getSingleQuotedAttributeValue,
	getSingleQuotedStringToken,
	getDoubleQuotedAttributeValue,
	getDoubleQuotedStringToken;

	getTag = function ( tokenizer ) {
		return ( getOpeningTag( tokenizer ) || getClosingTag( tokenizer ) );
	};

	getOpeningTag = function ( tokenizer ) {
		var start, tag, attrs;

		start = tokenizer.pos;

		if ( !getStringMatch( tokenizer, '<' ) ) {
			return null;
		}

		tag = {
			type: TAG
		};

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
		allowWhitespace( tokenizer );

		// self-closing solidus?
		if ( getStringMatch( tokenizer, '/' ) ) {
			tag.selfClosing = true;
		}

		// closing angle bracket
		if ( !getStringMatch( tokenizer, '>' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return tag;
	};

	getClosingTag = function ( tokenizer ) {
		var start, tag;

		start = tokenizer.pos;

		if ( !getStringMatch( tokenizer, '<' ) ) {
			return null;
		}

		tag = { type: TAG, closing: true };

		// closing solidus
		if ( !getStringMatch( tokenizer, '/' ) ) {
			throw new Error( 'Unexpected character ' + tokenizer.remaining().charAt( 0 ) + ' (expected "/")' );
		}

		// tag name
		tag.name = getTagName( tokenizer );
		if ( !tag.name ) {
			throw new Error( 'Unexpected character ' + tokenizer.remaining().charAt( 0 ) + ' (expected tag name)' );
		}

		// closing angle bracket
		if ( !getStringMatch( tokenizer, '>' ) ) {
			throw new Error( 'Unexpected character ' + tokenizer.remaining().charAt( 0 ) + ' (expected ">")' );
		}

		return tag;
	};

	getTagName = getRegexMatcher( /^[a-zA-Z][a-zA-Z0-9\-]*/ );

	getAttributes = function ( tokenizer ) {
		var start, attrs, attr;

		start = tokenizer.pos;

		allowWhitespace( tokenizer );

		attr = getAttribute( tokenizer );

		if ( !attr ) {
			tokenizer.pos = start;
			return null;
		}

		attrs = [];

		while ( attr !== null ) {
			attrs[ attrs.length ] = attr;

			allowWhitespace( tokenizer );
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

	getAttributeName = getRegexMatcher( /^[^\s"'>\/=]+/ );

	

	getAttributeValue = function ( tokenizer ) {
		var start, value;

		start = tokenizer.pos;

		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, '=' ) ) {
			tokenizer.pos = start;
			return null;
		}

		value = getSingleQuotedAttributeValue( tokenizer ) || getDoubleQuotedAttributeValue( tokenizer ) || getUnquotedAttributeValue( tokenizer );

		if ( value === null ) {
			tokenizer.pos = start;
			return null;
		}

		return value;
	};

	getUnquotedAttributeValueText = getRegexMatcher( /^[^\s"'=<>`]+/ );

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
			type: TEXT,
			value: text
		};
	};

	getUnquotedAttributeValue = function ( tokenizer ) {
		var tokens, token;

		tokens = [];

		token = getMustacheOrTriple( tokenizer ) || getUnquotedAttributeValueToken( tokenizer );
		while ( token !== null ) {
			tokens[ tokens.length ] = token;
			token = getMustacheOrTriple( tokenizer ) || getUnquotedAttributeValueToken( tokenizer );
		}

		if ( !tokens.length ) {
			return null;
		}

		return tokens;
	};


	getSingleQuotedStringToken = function ( tokenizer ) {
		var start, text, index;

		start = tokenizer.pos;

		text = getSingleQuotedString( tokenizer );

		if ( !text ) {
			return null;
		}

		if ( ( index = text.indexOf( tokenizer.delimiters[0] ) ) !== -1 ) {
			text = text.substr( 0, index );
			tokenizer.pos = start + text.length;
		}

		return {
			type: TEXT,
			value: text
		};
	};

	getSingleQuotedAttributeValue = function ( tokenizer ) {
		var start, tokens, token;

		start = tokenizer.pos;

		if ( !getStringMatch( tokenizer, "'" ) ) {
			return null;
		}

		tokens = [];

		token = getMustacheOrTriple( tokenizer ) || getSingleQuotedStringToken( tokenizer );
		while ( token !== null ) {
			tokens[ tokens.length ] = token;
			token = getMustacheOrTriple( tokenizer ) || getSingleQuotedStringToken( tokenizer );
		}

		if ( !getStringMatch( tokenizer, "'" ) ) {
			tokenizer.pos = start;
			return null;
		}

		return tokens;

	};

	getDoubleQuotedStringToken = function ( tokenizer ) {
		var start, text, index;

		start = tokenizer.pos;

		text = getDoubleQuotedString( tokenizer );

		if ( !text ) {
			return null;
		}

		if ( ( index = text.indexOf( tokenizer.delimiters[0] ) ) !== -1 ) {
			text = text.substr( 0, index );
			tokenizer.pos = start + text.length;
		}

		return {
			type: TEXT,
			value: text
		};
	};

	getDoubleQuotedAttributeValue = function ( tokenizer ) {
		var start, tokens, token;

		start = tokenizer.pos;

		if ( !getStringMatch( tokenizer, '"' ) ) {
			return null;
		}

		tokens = [];

		token = getMustacheOrTriple( tokenizer ) || getDoubleQuotedStringToken( tokenizer );
		while ( token !== null ) {
			tokens[ tokens.length ] = token;
			token = getMustacheOrTriple( tokenizer ) || getDoubleQuotedStringToken( tokenizer );
		}

		if ( !getStringMatch( tokenizer, '"' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return tokens;

	};
}());