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
	getQuotedStringToken,
	getQuotedAttributeValue;

	getTag = function ( tokenizer ) {
		return getOpeningTag( tokenizer ) || getClosingTag( tokenizer );
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

		allowWhitespace( tokenizer );

		value = getQuotedAttributeValue( tokenizer, "'" ) ||
		        getQuotedAttributeValue( tokenizer, '"' ) ||
		        getUnquotedAttributeValue( tokenizer );
		
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

	getQuotedAttributeValue = function ( tokenizer, quoteMark ) {
		var start, tokens, token;

		start = tokenizer.pos;

		if ( !getStringMatch( tokenizer, quoteMark ) ) {
			return null;
		}

		tokens = [];

		token = getMustacheOrTriple( tokenizer ) || getQuotedStringToken( tokenizer, quoteMark );
		while ( token !== null ) {
			tokens[ tokens.length ] = token;
			token = getMustacheOrTriple( tokenizer ) || getQuotedStringToken( tokenizer, quoteMark );
		}

		if ( !getStringMatch( tokenizer, quoteMark ) ) {
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
			type: TEXT,
			value: remaining.substr( 0, index )
		};
	};

}());