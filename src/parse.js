(function ( A ) {
	
	'use strict';

	var utils,
		types,
		stripComments,
		getTokens,
		getTree,
		whitespace,
		alphanumerics,
		tokenize,

		TokenStream,
		MustacheBuffer,
		
		TextToken,
		MustacheToken,
		TripleToken,
		TagToken,
		AttributeValueToken,

		mustacheTypes,

		error;


	utils = A.utils;
	types = A.types;

	error = function ( char ) {
		throw 'Unexpected character ("' + char + '")';
	};


	whitespace = /\s/;
	alphanumerics = /[0-9a-zA-Z]/;

	


	

	MustacheBuffer = function () {
		this.value = '';
	};

	MustacheBuffer.prototype = {
		read: function ( char ) {
			var continueBuffering;

			this.value += char;

			// if this could turn out to be a tag, a mustache or a triple return true
			continueBuffering = ( this.isPartialMatchOf( A.delimiters[0] ) || this.isPartialMatchOf( A.tripleDelimiters[0] ) );
			return continueBuffering;
		},

		convert: function () {
			var mustache, triple, token;

			// store mustache and triple opening delimiters
			mustache = A.delimiters[0];
			triple = A.tripleDelimiters[0];

			// out of mustache and triple opening delimiters, try to match longest first.
			// if they're the same length then only one will match anyway, unless some
			// plonker has set them to the same thing (which should probably throw an error)
			if ( triple.length > mustache.length ) {

				// triple first
				if ( this.value.indexOf( triple ) === 0 ) {
					token = new TripleToken();
				}

				// mustache first
				else if ( this.value.indexOf( mustache ) === 0 ) {
					token = new MustacheToken();
				}
			}

			else {

				// mustache first
				if ( this.value.indexOf( mustache ) === 0 ) {
					token = new MustacheToken();
				}

				// triple first
				if ( this.value.indexOf( triple ) === 0 ) {
					token = new TripleToken();
				}
			}

			if ( token ) {
				while ( this.value.length ) {
					token.read( this.value.charAt( 0 ) );
					this.value = this.value.substring( 1 );
				}

				return token;
			}

			return false;
		},

		release: function () {
			var value = this.value;
			this.value = '';
			return value;
		},

		isEmpty: function () {
			return !this.value.length;
		},

		isPartialMatchOf: function ( str ) {
			// if str begins with this.value, the index will be 0
			return str.indexOf( this.value ) === 0;
		}
	};

	

	TokenStream = function () {
		this.tokens = [];
		this.buffer = new MustacheBuffer();
	};

	TokenStream.prototype = {
		read: function ( char ) {
			var mustacheToken, bufferValue;

			// if we're building a tag, send everything to it including delimiter characters
			if ( this.currentToken && this.currentToken.type === types.TAG ) {
				if ( this.currentToken.read( char ) ) {
					return true;
				}
			}

			// either we're not building a tag, or the character was rejected
			
			// send to buffer. if accepted, we don't need to do anything else
			if ( this.buffer.read( char ) ) {
				return true;
			}
			
			// can we convert the buffer to a mustache or triple?
			mustacheToken = this.buffer.convert();

			if ( mustacheToken ) {
				// if we were building a token, seal it
				if ( this.currentToken ) {
					this.currentToken.seal();
				}

				// start building the new mustache instead
				this.currentToken = this.tokens[ this.tokens.length ] = mustacheToken;
				return true;
			}


			// could not convert to a mustache. can we append to current token?
			bufferValue = this.buffer.release();

			if ( this.currentToken ) {
				while ( bufferValue.length ) {
					while ( bufferValue.length && this.currentToken.read( bufferValue.charAt( 0 ) ) ) {
						bufferValue = bufferValue.substring( 1 );
					}

					// still got something left over? create a new token
					if ( bufferValue.length ) {
						if ( bufferValue.charAt( 0 ) === '<' ) {
							this.currentToken = new TagToken();
							this.currentToken.read( '<' );
						} else {
							this.currentToken = new TextToken();
							this.currentToken.read( bufferValue.charAt( 0 ) );
						}

						this.tokens[ this.tokens.length ] = this.currentToken;
						bufferValue = bufferValue.substring( 1 );
					}
				}

				return true;
			}

			// otherwise we need to create a new token
			if ( char === '<' ) {
				this.currentToken = new TagToken();
			} else {
				this.currentToken = new TextToken();
			}

			this.currentToken.read( char );
			this.tokens[ this.tokens.length ] = this.currentToken;
			return true;
		},

		end: function () {
			if ( !this.buffer.isEmpty() ) {
				this.tokens[ this.tokens.length ] = this.buffer.convert();
			}
		}
	};

	TokenStream.fromString = function ( string ) {
		var stream, i, len;

		stream = new TokenStream();
		i = 0;
		len = string.length;

		while ( i < len ) {
			stream.read( string.charAt( i ) );
			i += 1;
		}

		stream.end();

		return stream;
	};



	TextToken = function () {
		this.type = types.TEXT;
		this.value = '';
	};

	TextToken.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// this can be anything except a '<'
			if ( char === '<' ) {
				return false;
			}

			this.value += char;
			return true;
		},

		// merge: function ( token ) {
		// 	this.value += token.value;
		// },

		seal: function () {
			this.sealed = true;
		}
	};


	mustacheTypes = {
		'#': types.SECTION,
		'^': types.INVERTED,
		'/': types.CLOSING,
		'>': types.PARTIAL
	};


	MustacheToken = function () {
		this.value = '';
		this.openingDelimiter = A.delimiters[0];
		this.closingDelimiter = A.delimiters[1];
	};

	TripleToken = function () {
		this.value = '';
		this.openingDelimiter = A.tripleDelimiters[0];
		this.closingDelimiter = A.tripleDelimiters[1];

		this.type = types.TRIPLE;
	};

	MustacheToken.prototype = TripleToken.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			this.value += char;

			if ( this.value.substr( -this.closingDelimiter.length ) === this.closingDelimiter ) {
				this.seal();
			}

			return true;
		},

		seal: function () {
			var trimmed, firstChar, identifiers;

			// lop off opening and closing delimiters, and leading/trailing whitespace
			trimmed = this.value.replace( this.openingDelimiter, '' ).replace( this.closingDelimiter, '' ).trim();

			// are we dealing with a delimiter change?
			if ( trimmed.charAt( 0 ) === '=' ) {
				this.changeDelimiters( trimmed );
				this.type = types.DELIMCHANGE;
			}

			// if type isn't TRIPLE or DELIMCHANGE, determine from first character
			if ( !this.type ) {
				
				firstChar = trimmed.charAt( 0 );
				if ( mustacheTypes[ firstChar ] ) {
					
					this.type = mustacheTypes[ firstChar ];
					trimmed = trimmed.substring( 1 ).trim();

				} else {
					this.type = types.INTERPOLATOR;
				}
			}

			// get partial keypath and any formatters
			identifiers = trimmed.split( '|' );

			this.partialKeypath = identifiers.shift().trim();

			if ( identifiers.length ) {
				this.formatters = identifiers.map( function ( name ) {
					return name.trim();
				});
			}

			// TODO
			this.sealed = true;
		},

		changeDelimiters: function ( str ) {
			var delimiters, newDelimiters;

			newDelimiters = /\=([^\s=]+)\s+([^\s=]+)=/.exec( str );
			delimiters = ( this.type === types.TRIPLE ? A.tripleDelimiters : A.delimiters );

			delimiters[0] = newDelimiters[1];
			delimiters[1] = newDelimiters[2]; 
		}
	};


	var OpeningBracket, TagName, AttributeCollection, Solidus, ClosingBracket, Attribute, AttributeName, AttributeValue;


	var genericToken = function ( options ) {
		var Token, pattern, length;

		if ( typeof options.pattern === 'string' ) {
			length = options.pattern.length;
			pattern = new RegExp( '^' + A.utils.escape( options.pattern ) + '$' );
		} else {
			pattern = options.pattern;
		}


		Token = function () {
			this.value = '';
			this.pattern = pattern;
			this.required = options.required;

			this.length = options.length || length;
		};

		Token.prototype = {
			toString: options.toString || function () {
				return this.value;
			},

			read: function ( char ) {
				var newValue;

				if ( char.length > 1 ) {
					throw 'Token can only read one character at a time';
				}

				if ( this.sealed ) {
					return false;
				}

				newValue = this.value + char;

				if ( this.pattern.test( newValue ) ) {
					this.value = newValue;

					// if we know how long this token should be, and we're at that length, we can seal
					if ( this.length && this.value.length === this.length ) {
						this.seal();
					}

					return true;
				}

				this.seal();
				return false;
			},

			seal: function () {
				var i, properties, match, value;

				value = this.value;

				if ( this.required && !pattern.test( value ) ) {
					throw 'Token string "' + value + '" did not match pattern ' + pattern;
				}

				if ( options.properties && pattern ) {
					properties = ( typeof options.properties === 'string' ? [ options.properties ] : options.properties );

					i = properties.length;
					match = pattern.exec( this.value );

					while ( i-- ) {
						this[ properties[i] ] = ( match ? match[ i+1 ] : '' );
					}
				}

				if ( options.onseal ) {
					options.onseal.call( this, value );
				}

				this.sealed = true;
			}
		};

		return Token;
	};




	TagToken = function () {
		this.type = types.TAG;

		this.openingBracket     = new OpeningBracket();
		this.closingTagSolidus  = new Solidus();
		this.tagName            = new TagName();
		this.attributes         = new AttributeCollection();
		this.selfClosingSolidus = new Solidus();
		this.closingBracket     = new ClosingBracket();
	};

	TagToken.prototype = {
		read: function ( char ) {
			var accepted;

			if ( this.sealed ) {
				return false;
			}

			// if there is room for this character, read it
			accepted = this.openingBracket.read( char ) ||
				this.closingTagSolidus.read( char )     ||
				this.tagName.read( char )               ||
				this.attributes.read( char )            ||
				this.selfClosingSolidus.read( char )    ||
				this.closingBracket.read( char );

			if ( accepted ) {
				// if closing bracket is sealed, so are we. save ourselves a trip
				if ( this.closingBracket.sealed ) {
					this.seal();
				}

				return true;
			}

			// otherwise we are done with this token
			this.seal();
			return false;
		},

		seal: function () {
			var i, len, attributes, numAttributes;

			// time to figure out some stuff about this tag
			
			// tag name
			this.tag = this.tagName.value;

			// opening or closing tag?
			if ( this.closingTagSolidus.value ) {
				this.isClosingTag = true;
			}

			// self-closing?
			if ( this.selfClosingSolidus.value ) {
				this.isSelfClosingTag = true;
			}

			this.sealed = true;
		}
	};


	OpeningBracket = genericToken({
		pattern: '<',
		required: true
	});


	TagName = genericToken({
		pattern: /^([a-zA-Z][a-zA-Z0-9]*)$/,
		required: true
	});


	



	AttributeCollection = function () {
		this.items = [];
	};

	AttributeCollection.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// are we currently building an attribute?
			if ( this.nextItem ) {
				// can it take this character?
				if ( this.nextItem.read( char ) ) {
					return true;
				}
			}

			// ignore whitespace before attributes
			if ( whitespace.test( char ) ) {
				return true;
			}

			// if not, start a new attribute
			this.nextItem = new Attribute();

			// will it accept this character? if so add the new attribute
			if ( this.nextItem.read( char ) ) {
				this.items[ this.items.length ] = this.nextItem;
				return true;
			}

			// if not, we're done here
			else {
				this.seal();
				return false;
			}
		},

		seal: function () {
			this.sealed = true;
		}
	};



	Attribute = function () {
		this.name = new AttributeName();
		this.value = new AttributeValue();
	};

	Attribute.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// can we append this character to the attribute name?
			if ( this.name.read( char ) ) {
				return true;
			}
			
			// if not, only continue if we had a name in the first place
			if ( !this.name.value ) {
				this.seal();
				return false;
			}

			// send character to this.value
			if ( this.value.read( char ) ) {
				return true;
			}
			
			// rejected? okay, we're done
			this.seal();
			return false;
		},

		seal: function () {
			// TODO
			this.sealed = true;
		}
	};





	AttributeName = function () {};

	AttributeName.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			// first char?
			if ( !this.value ) {
				// first char must be letter, underscore or colon. (It really shouldn't be a colon.)
				if ( /[a-zA-Z_:]/.test( char ) ) {
					this.value = char;
					return true;
				}

				this.seal();
				return false;
			}

			// subsequent chars can be letters, numbers, underscores, colons, periods, or hyphens. Yeah. Nuts.
			if ( /[_:a-zA-Z0-9\.\-]/.test( char ) ) {
				this.value += char;
				return true;
			}

			this.seal();
			return false;
		},

		seal: function () {
			this.sealed = true;
		}
	};


	AttributeValue = function () {
		this.tokens = [];
		this.buffer = new MustacheBuffer();

		this.expected = false;
	};

	AttributeValue.prototype = {
		read: function ( char ) {
			var mustacheToken, bufferValue;

			if ( this.sealed ) {
				return false;
			}

			// have we had the = character yet?
			if ( !this.expected ) {
				// ignore whitespace between name and =
				if ( whitespace.test( char ) ) {
					return true;
				}

				// if we have the =, we can read in the value
				if ( char === '=' ) {
					this.expected = true;
					return true;
				}

				// anything else is an error
				return false;
			}

			
			if ( !this.tokens.length ) {
				// ignore leading whitespace
				if ( whitespace.test( char ) ) {
					return true;
				}

				// if we get a " or a ', flag value as quoted
				if ( char === '"' || char === "'" ) {
					this.quoteMark = char;
					return true;
				}
			}

			
			// send character to buffer
			if ( this.buffer.read( char ) ) {
				return true;
			}


			// buffer rejected char. can we convert it to a mustache or triple?
			mustacheToken = this.buffer.convert();

			if ( mustacheToken ) {
				// if we were building a token, seal it
				if ( this.currentToken ) {
					this.currentToken.seal();
				}

				// start building the new mustache instead
				this.currentToken = this.tokens[ this.tokens.length ] = mustacheToken;
				return true;
			}


			// could not convert to a mustache. can we append to current token?
			bufferValue = this.buffer.release();

			if ( this.currentToken ) {
				while ( bufferValue.length ) {

					while ( bufferValue.length && bufferValue.charAt( 0 ) !== this.quoteMark && this.currentToken.read( bufferValue.charAt( 0 ) ) ) {
						bufferValue = bufferValue.substring( 1 );
					}

					// still got something left over? create a new token
					if ( bufferValue.length && bufferValue.charAt( 0 ) !== this.quoteMark ) {
						this.currentToken = new AttributeValueToken( this.quoteMark );
						this.currentToken.read( bufferValue.charAt( 0 ) );

						this.tokens[ this.tokens.length ] = this.currentToken;
						bufferValue = bufferValue.substring( 1 );
					}

					// closing quoteMark? seal value
					if ( bufferValue.charAt( 0 ) === this.quoteMark ) {
						this.currentToken.seal();
						this.seal();
						return true;
					}
				}

				return true;
			}

			// otherwise we need to create a new token
			this.currentToken = new AttributeValueToken( this.quoteMark );

			this.currentToken.read( char );
			this.tokens[ this.tokens.length ] = this.currentToken;
			return true;
		},

		seal: function () {
			this.sealed = true;
		}
	};


	AttributeValueToken = function ( quoteMark ) {
		this.type = types.ATTR_VALUE_TOKEN;

		this.quoteMark = quoteMark || '';
		this.value = '';
	};

	AttributeValueToken.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			if ( char === this.quoteMark ) {
				this.seal();
				return true;
			}

			// within quotemarks, anything goes
			if ( this.quoteMark ) {
				this.value += char;
				return true;
			}

			// without quotemarks, the following characters are invalid: whitespace, ", ', =, <, >, `
			if ( /[\s"'=<>`]/.test( char ) ) {
				this.seal();
				return false;
			}

			this.value += char;
			return true;
		},

		seal: function () {
			this.sealed = true;
		}
	};



	Solidus = genericToken({
		pattern: '/'
	});

	ClosingBracket = genericToken({
		pattern: '>',
		required: true
	});
	





	tokenize = function ( template ) {
		var stream, fragmentStub;

		stream = TokenStream.fromString( template );
		fragmentStub = A.utils.getFragmentStubFromTokens( stream.tokens );

		return fragmentStub;
	};



	A.utils.tokenize = tokenize;

}( Anglebars ));