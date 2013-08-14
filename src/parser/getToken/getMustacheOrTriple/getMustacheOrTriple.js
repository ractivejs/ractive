var getMustacheOrTriple;

// mustache / triple
(function () {
	var getMustache,
		getTriple,
		getMustacheContent,
		getMustacheType,
		getIndexRef,
		mustacheTypes,
		getDelimiter,
		getDelimiterChange;

	getMustacheOrTriple = function ( tokenizer ) {
		// if the triple delimiter (e.g. '{{{') is longer than the regular mustache
		// delimiter (e.g. '{{') then we need to try and find a triple first. Otherwise
		// we will get a false positive if the mustache delimiter is a substring of the
		// triple delimiter, as in the default case
		if ( tokenizer.tripleDelimiters[0].length > tokenizer.delimiters[0].length ) {
			return getTriple( tokenizer ) || getMustache( tokenizer );
		}

		return getMustache( tokenizer ) || getTriple( tokenizer );
	};

	getMustache = function ( tokenizer ) {
		var start = tokenizer.pos, content;

		if ( !getStringMatch( tokenizer, tokenizer.delimiters[0] ) ) {
			return null;
		}

		// delimiter change?
		content = getDelimiterChange( tokenizer );
		if ( content ) {
			// find closing delimiter or abort...
			if ( !getStringMatch( tokenizer, tokenizer.delimiters[1] ) ) {
				tokenizer.pos = start;
				return null;
			}

			// ...then make the switch
			tokenizer.delimiters = content;
			return { type: MUSTACHE, mustacheType: DELIMCHANGE };
		}

		content = getMustacheContent( tokenizer );

		if ( content === null ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace before closing delimiter
		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, tokenizer.delimiters[1] ) ) {
			fail( tokenizer, '"' + tokenizer.delimiters[1] + '"' );
		}

		return content;
	};

	getTriple = function ( tokenizer ) {
		var start = tokenizer.pos, content;

		if ( !getStringMatch( tokenizer, tokenizer.tripleDelimiters[0] ) ) {
			return null;
		}

		// delimiter change?
		content = getDelimiterChange( tokenizer );
		if ( content ) {
			// find closing delimiter or abort...
			if ( !getStringMatch( tokenizer, tokenizer.tripleDelimiters[1] ) ) {
				tokenizer.pos = start;
				return null;
			}

			// ...then make the switch
			tokenizer.tripleDelimiters = content;
			return { type: MUSTACHE, mustacheType: DELIMCHANGE };
		}

		// allow whitespace between opening delimiter and reference
		allowWhitespace( tokenizer );

		content = getMustacheContent( tokenizer, true );

		if ( content === null ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace between reference and closing delimiter
		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, tokenizer.tripleDelimiters[1] ) ) {
			tokenizer.pos = start;
			return null;
		}

		return content;
	};

	getMustacheContent = function ( tokenizer, isTriple ) {
		var start, mustache, type, expr, i, remaining, index;

		start = tokenizer.pos;

		mustache = { type: isTriple ? TRIPLE : MUSTACHE };

		// mustache type
		if ( !isTriple ) {
			type = getMustacheType( tokenizer );
			mustache.mustacheType = type || INTERPOLATOR; // default

			// if it's a comment or a section closer, allow any contents except '}}'
			if ( type === COMMENT || type === CLOSING ) {
				remaining = tokenizer.remaining();
				index = remaining.indexOf( tokenizer.delimiters[1] );

				if ( index !== -1 ) {
					mustache.ref = remaining.substr( 0, index );
					tokenizer.pos += index;
					return mustache;
				}
			}
		}

		// allow whitespace
		allowWhitespace( tokenizer );

		// get expression
		expr = getExpression( tokenizer );

		while ( expr.t === BRACKETED && expr.x ) {
			expr = expr.x;
		}

		if ( expr.t === REFERENCE ) {
			mustache.ref = expr.n;
		} else {
			mustache.expression = expr;
		}

		// optional index reference
		i = getIndexRef( tokenizer );
		if ( i !== null ) {
			mustache.indexRef = i;
		}

		return mustache;
	};

	mustacheTypes = {
		'#': SECTION,
		'^': INVERTED,
		'/': CLOSING,
		'>': PARTIAL,
		'!': COMMENT,
		'&': INTERPOLATOR
	};

	getMustacheType = function ( tokenizer ) {
		var type = mustacheTypes[ tokenizer.str.charAt( tokenizer.pos ) ];

		if ( !type ) {
			return null;
		}

		tokenizer.pos += 1;
		return type;
	};

	getIndexRef = getRegexMatcher( /^\s*:\s*([a-zA-Z_$][a-zA-Z_$0-9]*)/ );

	getDelimiter = getRegexMatcher( /^[^\s=]+/ );

	getDelimiterChange = function ( tokenizer ) {
		var start, opening, closing;

		if ( !getStringMatch( tokenizer, '=' ) ) {
			return null;
		}

		start = tokenizer.pos;

		// allow whitespace before new opening delimiter
		allowWhitespace( tokenizer );

		opening = getDelimiter( tokenizer );
		if ( !opening ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace (in fact, it's necessary...)
		allowWhitespace( tokenizer );

		closing = getDelimiter( tokenizer );
		if ( !closing ) {
			tokenizer.pos = start;
			return null;
		}

		// allow whitespace before closing '='
		allowWhitespace( tokenizer );

		if ( !getStringMatch( tokenizer, '=' ) ) {
			tokenizer.pos = start;
			return null;
		}

		return [ opening, closing ];
	};

}());