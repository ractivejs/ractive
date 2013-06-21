var getToken;

(function () {

	var getStringMatch,
	getRegexMatcher,
	allowWhitespace,

	getMustache,
	getTriple,
	getTag,
	getText,
	getExpression,

	getDelimiter,
	getDelimiterChange,
	getName,
	getMustacheRef,
	getRefinement,
	getDotRefinement,
	getArrayRefinement,
	getArrayMember,

	getSingleQuotedString,
	getUnescapedSingleQuotedChars,
	getDoubleQuotedString,
	getUnescapedDoubleQuotedChars,
	getEscapedChars,
	getEscapedChar,

	fail;


	getToken = function ( tokenizer ) {
		var token = getMustache( tokenizer ) ||
		        getTriple( tokenizer ) ||
		        getTag( tokenizer ) ||
		        getText( tokenizer );

		return token;
	};



	// helpers
	fail = function ( tokenizer, expected ) {
		var remaining = tokenizer.remaining().substr( 0, 40 );
		if ( remaining.length === 40 ) {
			remaining += '...';
		}
		throw new Error( 'Tokenizer failed: unexpected string "' + remaining + '" (expected ' + expected + ')' );
	};

	getStringMatch = function ( tokenizer, string ) {
		var substr;

		substr = tokenizer.str.substr( tokenizer.pos, string.length );

		if ( substr === string ) {
			tokenizer.pos += string.length;
			return string;
		}

		return null;
	};

	getRegexMatcher = function ( regex ) {
		return function ( tokenizer ) {
			var match = regex.exec( tokenizer.str.substring( tokenizer.pos ) );

			if ( !match ) {
				return null;
			}

			tokenizer.pos += match[0].length;
			return match[1] || match[0];
		};
	};

	allowWhitespace = function ( tokenizer ) {
		var match = leadingWhitespace.exec( tokenizer.str.substring( tokenizer.pos ) );

		if ( !match ) {
			return null;
		}

		tokenizer.pos += match[0].length;
		return match[0];
	};


	// shared
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

	getName = getRegexMatcher( /^[a-zA-Z_$][a-zA-Z_$0-9]*/ );

	getMustacheRef = function ( tokenizer ) {
		var start, ref, member, dot, name;

		start = tokenizer.pos;

		dot = getStringMatch( tokenizer, '.' ) || '';
		name = getName( tokenizer ) || '';

		if ( dot && !name ) {
			return dot;
		}

		ref = dot + name;
		if ( !ref ) {
			return null;
		}

		member = getRefinement( tokenizer );
		while ( member !== null ) {
			ref += member;
			member = getRefinement( tokenizer );
		}

		return ref;
	};

	getRefinement = function ( tokenizer ) {
		return getDotRefinement( tokenizer ) || getArrayRefinement( tokenizer );
	};

	getDotRefinement = getRegexMatcher( /^\.[a-zA-Z_$][a-zA-Z_$0-9]*/ );

	getArrayRefinement = function ( tokenizer ) {
		var num = getArrayMember( tokenizer );

		if ( num ) {
			return '.' + num;
		}

		return null;
	};

	getArrayMember = getRegexMatcher( /^\[(0|[1-9][0-9]*)\]/ );

	getSingleQuotedString = function ( tokenizer ) {
		var start, string, escaped, unescaped, next;

		start = tokenizer.pos;

		string = '';

		escaped = getEscapedChars( tokenizer );
		if ( escaped ) {
			string += escaped;
		}

		unescaped = getUnescapedSingleQuotedChars( tokenizer );
		if ( unescaped ) {
			string += unescaped;
		}
		if ( string ) {
			next = getSingleQuotedString( tokenizer );
			while ( next ) {
				string += next;
				next = getSingleQuotedString( tokenizer );
			}
		}

		return string;
	};

	getUnescapedSingleQuotedChars = getRegexMatcher( /^[^\\']+/ );

	getDoubleQuotedString = function ( tokenizer ) {
		var start, string, escaped, unescaped, next;

		start = tokenizer.pos;

		string = '';

		escaped = getEscapedChars( tokenizer );
		if ( escaped ) {
			string += escaped;
		}

		unescaped = getUnescapedDoubleQuotedChars( tokenizer );
		if ( unescaped ) {
			string += unescaped;
		}

		if ( !string ) {
			return '';
		}

		next = getDoubleQuotedString( tokenizer );
		while ( next !== '' ) {
			string += next;
		}

		return string;
	};

	getUnescapedDoubleQuotedChars = getRegexMatcher( /^[^\\"]+/ );

	getEscapedChars = function ( tokenizer ) {
		var chars = '', character;

		character = getEscapedChar( tokenizer );
		while ( character ) {
			chars += character;
			character = getEscapedChar( tokenizer );
		}

		return chars || null;
	};

	getEscapedChar = function ( tokenizer ) {
		var character;

		if ( !getStringMatch( tokenizer, '\\' ) ) {
			return null;
		}

		character = tokenizer.str.charAt( tokenizer.pos );
		tokenizer.pos += 1;

		return character;
	};

	



	// mustache / triple
	(function () {
		var getMustacheContent,
			getMustacheType,
			getIndexRef,
			mustacheTypes;

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
				if ( !getStringMatch( tokenizer, tokenizer.delimiters[1] ) ) {
					tokenizer.pos = start;
					return null;
				}

				// ...then make the switch
				tokenizer.tripleDelimiters = content;
				return { type: DELIMCHANGE };
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

				// if it's a comment, allow any contents except '}}'
				if ( type === COMMENT ) {
					remaining = tokenizer.remaining();
					index = remaining.indexOf( tokenizer.delimiters[1] );

					if ( index !== -1 ) {
						tokenizer.pos += index;
						return mustache;
					}
				}
			}

			// allow whitespace
			allowWhitespace( tokenizer );

			// is this an expression?
			if ( getStringMatch( tokenizer, '(' ) ) {
				
				// looks like it...
				allowWhitespace( tokenizer );

				expr = getExpression( tokenizer );

				allowWhitespace( tokenizer );

				if ( !getStringMatch( tokenizer, ')' ) ) {
					fail( tokenizer, '")"' );
				}

				mustache.expression = expr;
			}

			else {
				// mustache reference
				mustache.ref = getMustacheRef( tokenizer );
				if ( !mustache.ref ) {
					tokenizer.pos = start;
					return null;
				}
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
	}());


	// tag
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

		getTagName = getRegexMatcher( /^[a-zA-Z][a-zA-Z0-9]*/ );

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

			token = getMustache( tokenizer ) || getUnquotedAttributeValueToken( tokenizer );
			while ( token !== null ) {
				tokens[ tokens.length ] = token;
				token = getMustache( tokenizer ) || getUnquotedAttributeValueToken( tokenizer );
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

			token = getMustache( tokenizer ) || getSingleQuotedStringToken( tokenizer );
			while ( token !== null ) {
				tokens[ tokens.length ] = token;
				token = getMustache( tokenizer ) || getSingleQuotedStringToken( tokenizer );
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

			token = getMustache( tokenizer ) || getDoubleQuotedStringToken( tokenizer );
			while ( token !== null ) {
				tokens[ tokens.length ] = token;
				token = getMustache( tokenizer ) || getDoubleQuotedStringToken( tokenizer );
			}

			if ( !getStringMatch( tokenizer, '"' ) ) {
				tokenizer.pos = start;
				return null;
			}

			return tokens;

		};
	}());


	// text
	(function () {
		getText = function ( tokenizer ) {
			var minIndex, text;

			minIndex = tokenizer.str.length;

			// anything goes except opening delimiters or a '<'
			[ tokenizer.delimiters[0], tokenizer.tripleDelimiters[0], '<' ].forEach( function ( substr ) {
				var index = tokenizer.str.indexOf( substr, tokenizer.pos );

				if ( index !== -1 ) {
					minIndex = Math.min( index, minIndex );
				}
			});

			if ( minIndex === tokenizer.pos ) {
				return null;
			}

			text = tokenizer.str.substring( tokenizer.pos, minIndex );
			tokenizer.pos = minIndex;

			return {
				type: TEXT,
				value: text
			};

		};
	}());


	// expression
	(function () {
		var getExpressionList,
		makePrefixSequenceMatcher,
		makeInfixSequenceMatcher,
		getRightToLeftSequenceMatcher,
		getBracketedExpression,
		getPrimary,
		getMember,
		getInvocation,
		getTypeOf,
		getLogicalOr,
		getConditional,
		
		getDigits,
		getExponent,
		getFraction,
		getInteger,
		
		getReference,
		getRefinement,

		getLiteral,
		getArrayLiteral,
		getBooleanLiteral,
		getNumberLiteral,
		getStringLiteral,
		getObjectLiteral,
		getGlobal,

		getKeyValuePairs,
		getKeyValuePair,
		getKey,

		globals;

		getExpression = function ( tokenizer ) {

			var start, expression, fns, fn, i, len;

			start = tokenizer.pos;

			// The conditional operator is the lowest precedence operator (except yield,
			// assignment operators, and commas, none of which are supported), so we
			// start there. If it doesn't match, it 'falls through' to progressively
			// higher precedence operators, until it eventually matches (or fails to
			// match) a 'primary' - a literal or a reference. This way, the abstract syntax
			// tree has everything in its proper place, i.e. 2 + 3 * 4 === 14, not 20.
			expression = getConditional( tokenizer );

			return expression;
		};

		getExpressionList = function ( tokenizer ) {
			var start, expressions, expr, next;

			start = tokenizer.pos;

			allowWhitespace( tokenizer );

			expr = getExpression( tokenizer );

			if ( expr === null ) {
				return null;
			}

			expressions = [ expr ];

			// allow whitespace between expression and ','
			allowWhitespace( tokenizer );

			if ( getStringMatch( tokenizer, ',' ) ) {
				next = getExpressionList( tokenizer );
				if ( next === null ) {
					tokenizer.pos = start;
					return null;
				}

				expressions = expressions.concat( next );
			}

			return expressions;
		};

		getBracketedExpression = function ( tokenizer ) {
			var start, expr;

			start = tokenizer.pos;

			if ( !getStringMatch( tokenizer, '(' ) ) {
				return null;
			}

			allowWhitespace( tokenizer );

			expr = getExpression( tokenizer );
			if ( !expr ) {
				tokenizer.pos = start;
				return null;
			}

			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, ')' ) ) {
				tokenizer.pos = start;
				return null;
			}

			return {
				t: BRACKETED,
				x: expr
			};
		};

		getPrimary = function ( tokenizer ) {
			return getLiteral( tokenizer )
			    || getReference( tokenizer )
			    || getBracketedExpression( tokenizer );
		};

		getMember = function ( tokenizer ) {
			var start, expression, name, refinement, member;

			expression = getPrimary( tokenizer );
			if ( !expression ) {
				return null;
			}

			refinement = getRefinement( tokenizer );
			if ( !refinement ) {
				return expression;
			}

			while ( refinement !== null ) {
				member = {
					t: MEMBER,
					x: expression,
					r: refinement
				};

				expression = member;
				refinement = getRefinement( tokenizer );
			}

			return member;
		};

		getInvocation = function ( tokenizer ) {
			var start, expression, expressionList, result;

			expression = getMember( tokenizer );
			if ( !expression ) {
				return null;
			}

			start = tokenizer.pos;

			if ( !getStringMatch( tokenizer, '(' ) ) {
				return expression;
			}

			allowWhitespace( tokenizer );
			expressionList = getExpressionList( tokenizer );

			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, ')' ) ) {
				tokenizer.pos = start;
				return expression;
			}

			result = {
				t: INVOCATION,
				x: expression
			};

			if ( expressionList ) {
				result.o = expressionList;
			}

			return result;
		};

		// right-to-left
		makePrefixSequenceMatcher = function ( symbol, fallthrough ) {
			return function ( tokenizer ) {
				var start, expression;

				if ( !getStringMatch( tokenizer, symbol ) ) {
					return fallthrough( tokenizer );
				}

				start = tokenizer.pos;

				allowWhitespace( tokenizer );

				expression = getExpression( tokenizer );
				if ( !expression ) {
					fail( tokenizer, 'an expression' );
				}

				return {
					s: symbol,
					o: expression,
					t: PREFIX_OPERATOR
				};
			};
		};

		// create all prefix sequence matchers
		(function () {
			var i, len, matcher, prefixOperators, fallthrough;

			prefixOperators = '! ~ + - typeof'.split( ' ' );

			// An invocation operator is higher precedence than logical-not
			fallthrough = getInvocation;
			for ( i=0, len=prefixOperators.length; i<len; i+=1 ) {
				matcher = makePrefixSequenceMatcher( prefixOperators[i], fallthrough );
				fallthrough = matcher;
			}

			// typeof operator is higher precedence than multiplication, so provides the
			// fallthrough for the multiplication sequence matcher we're about to create
			// (we're skipping void and delete)
			getTypeOf = fallthrough;
		}());


		makeInfixSequenceMatcher = function ( symbol, fallthrough ) {
			return function ( tokenizer ) {
				var start, left, right;

				left = fallthrough( tokenizer );
				if ( !left ) {
					return null;
				}

				start = tokenizer.pos;

				allowWhitespace( tokenizer );

				if ( !getStringMatch( tokenizer, symbol ) ) {
					tokenizer.pos = start;
					return left;
				}

				allowWhitespace( tokenizer );

				right = getExpression( tokenizer );
				if ( !right ) {
					tokenizer.pos = start;
					return left;
				}

				return {
					t: INFIX_OPERATOR,
					s: symbol,
					o: [ left, right ]
				};
			};
		};

		// create all infix sequence matchers
		(function () {
			var i, len, matcher, infixOperators, fallthrough;

			// All the infix operators on order of precedence (source: https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/Operator_Precedence)
			// Each sequence matcher will initially fall through to its higher precedence
			// neighbour, and only attempt to match if one of the higher precedence operators
			// (or, ultimately, a literal, reference, or bracketed expression) already matched
			infixOperators = '* / % + - << >> >>> < <= > >= in instanceof == != === !== & ^ | && ||'.split( ' ' );

			// A typeof operator is higher precedence than multiplication
			fallthrough = getTypeOf;
			for ( i=0, len=infixOperators.length; i<len; i+=1 ) {
				matcher = makeInfixSequenceMatcher( infixOperators[i], fallthrough );
				fallthrough = matcher;
			}

			// Logical OR is the fallthrough for the conditional matcher
			getLogicalOr = fallthrough;
		}());
		

		// The conditional operator is the lowest precedence operator, so we start here
		getConditional = function ( tokenizer ) {
			var start, expression, ifTrue, ifFalse;

			expression = getLogicalOr( tokenizer );
			if ( !expression ) {
				return null;
			}

			start = tokenizer.pos;

			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, '?' ) ) {
				tokenizer.pos = start;
				return expression;
			}

			allowWhitespace( tokenizer );

			ifTrue = getExpression( tokenizer );
			if ( !ifTrue ) {
				tokenizer.pos = start;
				return expression;
			}

			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, ':' ) ) {
				tokenizer.pos = start;
				return expression;
			}

			allowWhitespace( tokenizer );

			ifFalse = getExpression( tokenizer );
			if ( !ifFalse ) {
				tokenizer.pos = start;
				return expression;
			}

			return {
				t: CONDITIONAL,
				o: [ expression, ifTrue, ifFalse ]
			};
		};
		


		getDigits = getRegexMatcher( /^[0-9]+/ );
		getExponent = getRegexMatcher( /^[eE][\-+]?[0-9]+/ );
		getFraction = getRegexMatcher( /^\.[0-9]+/ );
		getInteger = getRegexMatcher( /^(0|[1-9][0-9]*)/ );


		getReference = function ( tokenizer ) {
			var name, dot, combo;

			// could be an implicit iterator ('.'), a prefixed reference ('.name') or a
			// standard reference ('name')
			dot = getStringMatch( tokenizer, '.' ) || '';
			name = getName( tokenizer ) || '';

			combo = dot + name;

			if ( !combo ) {
				return null;
			}

			return {
				t: REFERENCE,
				n: combo
			};
		};

		getRefinement = function ( tokenizer ) {
			var start, refinement, name, expr;

			start = tokenizer.pos;

			allowWhitespace( tokenizer );

			// "." name
			if ( getStringMatch( tokenizer, '.' ) ) {
				allowWhitespace( tokenizer );

				if ( name = getName( tokenizer ) ) {
					return {
						t: REFINEMENT,
						n: name
					};
				}

				fail( 'a property name' );
			}

			// "[" expression "]"
			if ( getStringMatch( tokenizer, '[' ) ) {
				allowWhitespace( tokenizer );

				expr = getExpression( tokenizer );
				if ( !expr ) {
					fail( 'an expression' );
				}

				allowWhitespace( tokenizer );

				if ( !getStringMatch( tokenizer, ']' ) ) {
					fail( '"]"' );
				}

				return {
					t: REFINEMENT,
					x: expr
				};
			}

			return null;
		};

		// Any literal except function and regexp literals, which aren't supported (yet?)
		getLiteral = function ( tokenizer ) {
			var literal = getNumberLiteral( tokenizer )   ||
			              getBooleanLiteral( tokenizer )  ||
			              getGlobal( tokenizer )          ||
			              getStringLiteral( tokenizer )   ||
			              getObjectLiteral( tokenizer )   ||
			              getArrayLiteral( tokenizer );

			return literal;
		};

		getArrayLiteral = function ( tokenizer ) {
			var start, array, expressions;

			start = tokenizer.pos;

			// allow whitespace before '['
			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, '[' ) ) {
				tokenizer.pos = start;
				return null;
			}

			expressions = expressionList( tokenizer );

			if ( !getStringMatch( tokenizer, ']' ) ) {
				tokenizer.pos = start;
				return null;
			}

			return {
				t: ARRAY_LITERAL,
				o: expressions
			};
		};

		getBooleanLiteral = function ( tokenizer ) {
			var remaining = tokenizer.remaining();

			if ( remaining.substr( 0, 4 ) === 'true' ) {
				tokenizer.pos += 4;
				return {
					t: BOOLEAN_LITERAL,
					v: 'true'
				};
			}

			if ( remaining.substr( 0, 5 ) === 'false' ) {
				tokenizer.pos += 5;
				return {
					t: BOOLEAN_LITERAL,
					v: 'false'
				};
			}

			return null;
		};

		globals = /^(?:Array|Date|RegExp|decodeURIComponent|decodeURI|encodeURIComponent|encodeURI|isFinite|isNaN|parseFloat|parseInt|JSON|Math|NaN|undefined|null)/;

		// Not strictly literals, but we can treat them as such because they
		// never need to be dereferenced.

		// Allowed globals:
		// ----------------
		//
		// Array, Date, RegExp, decodeURI, decodeURIComponent, encodeURI, encodeURIComponent, isFinite, isNaN, parseFloat, parseInt, JSON, Math, NaN, undefined, null
		getGlobal = function ( tokenizer ) {
			var start, name, match, global;

			start = tokenizer.pos;
			name = getName( tokenizer );

			if ( !name ) {
				return null;
			}

			match = globals.exec( name );
			if ( match ) {
				tokenizer.pos = start + match[0].length;
				return {
					t: GLOBAL,
					v: match[0]
				};
			}

			tokenizer.pos = start;
			return null;
		};

		getNumberLiteral = function ( tokenizer ) {
			var start, result;

			start = tokenizer.pos;

			// special case - we may have a decimal without a literal zero (because
			// some programmers are plonkers)
			if ( result = getFraction( tokenizer ) ) {
				return {
					t: NUMBER_LITERAL,
					v: result
				};
			}

			result = getInteger( tokenizer );
			if ( result === null ) {
				return null;
			}

			result += getFraction( tokenizer ) || '';
			result += getExponent( tokenizer ) || '';

			return {
				t: NUMBER_LITERAL,
				v: result
			};
		};

		getObjectLiteral = function ( tokenizer ) {
			var start, pairs, keyValuePairs, i, pair;

			start = tokenizer.pos;

			// allow whitespace
			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, '{' ) ) {
				tokenizer.pos = start;
				return null;
			}

			keyValuePairs = getKeyValuePairs( tokenizer );

			// allow whitespace between final value and '}'
			allowWhitespace( tokenizer );

			if ( !getStringMatch( tokenizer, '}' ) ) {
				tokenizer.pos = start;
				return null;
			}

			return {
				t: OBJECT_LITERAL,
				m: keyValuePairs
			};
		};

		getKeyValuePairs = function ( tokenizer ) {
			var start, pairs, pair, keyValuePairs;

			start = tokenizer.pos;

			pair = getKeyValuePair( tokenizer );
			if ( pair === null ) {
				return null;
			}

			pairs = [ pair ];

			if ( getStringMatch( tokenizer, ',' ) ) {
				keyValuePairs = getKeyValuePairs( tokenizer );

				if ( !keyValuePairs ) {
					tokenizer.pos = start;
					return null;
				}

				return pairs.concat( keyValuePairs );
			}

			return pairs;
		};

		getKeyValuePair = function ( tokenizer ) {
			var start, pair, key, value;

			start = tokenizer.pos;

			// allow whitespace between '{' and key
			allowWhitespace( tokenizer );

			key = getKey( tokenizer );
			if ( key === null ) {
				tokenizer.pos = start;
				return null;
			}

			// allow whitespace between key and ':'
			allowWhitespace( tokenizer );

			// next character must be ':'
			if ( !getStringMatch( tokenizer, ':' ) ) {
				tokenizer.pos = start;
				return null;
			}

			// allow whitespace between ':' and value
			allowWhitespace( tokenizer );

			// next expression must be a, well... expression
			value = getExpression( tokenizer );
			if ( value === null ) {
				tokenizer.pos = start;
				return null;
			}

			return {
				t: KEY_VALUE_PAIR,
				k: key,
				v: value
			};
		};

		// http://mathiasbynens.be/notes/javascript-properties
		// can be any name, string literal, or number literal
		getKey = function ( tokenizer ) {
			return getName( tokenizer ) || getStringLiteral( tokenizer ) || getNumberLiteral( tokenizer );
		};

		getStringLiteral = function ( tokenizer ) {
			var start, string;

			start = tokenizer.pos;

			if ( getStringMatch( tokenizer, '"' ) ) {
				string = getDoubleQuotedString( tokenizer );
			
				if ( !getStringMatch( tokenizer, '"' ) ) {
					tokenizer.pos = start;
					return null;
				}

				return {
					t: STRING_LITERAL,
					v: string
				};
			}

			if ( getStringMatch( tokenizer, "'" ) ) {
				string = getSingleQuotedString( tokenizer );

				if ( !getStringMatch( tokenizer, "'" ) ) {
					tokenizer.pos = start;
					return null;
				}

				return {
					t: STRING_LITERAL,
					v: string
				};
			}

			return null;
		};
		
	}());


}());