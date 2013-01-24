(function ( A ) {
	
	'use strict';

	var utils,
		types,
		stripComments,
		getTokens,
		getTree,
		whitespace,
		alphanumerics,
		parse,

		TokenStream,
		TagBuffer,
		
		TextToken,
		MustacheToken,
		TripleToken,
		TagToken,

		TextStub,
		MustacheStub,
		FragmentStub,
		ElementStub,
		voidElementNames,
		implicitClosersByTagName,
		closedByParentClose,

		mustacheTypes;


	utils = A.utils;
	types = A.types;


	whitespace = /\s/;
	alphanumerics = /[0-9a-zA-Z]/;

	voidElementNames = [ 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr' ];

	closedByParentClose = [ 'li', 'dd', 'rt', 'rp', 'optgroup', 'option', 'tbody', 'tfoot', 'tr', 'td', 'th' ];

	implicitClosersByTagName = {
		li: [ 'li' ],
		dt: [ 'dt', 'dd' ],
		dd: [ 'dt', 'dd' ],
		p: [ 'address', 'article', 'aside', 'blockquote', 'dir', 'div', 'dl', 'fieldset', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'table', 'ul' ],
		rt: [ 'rt', 'rp' ],
		rp: [ 'rp', 'rt' ],
		optgroup: [ 'optgroup' ],
		option: [ 'option', 'optgroup' ],
		thead: [ 'tbody', 'tfoot' ],
		tbody: [ 'tbody', 'tfoot' ],
		tr: [ 'tr' ],
		td: [ 'td', 'th' ],
		th: [ 'td', 'th' ]
	};


	stripComments = function ( template ) {
		var commentStart, commentEnd, remaining, processed;

		remaining = template;
		processed = '';

		while ( remaining.length ) {
			commentStart = remaining.indexOf( '<!--' );
			commentEnd = remaining.indexOf( '-->' );

			// no comments? great
			if ( commentStart === -1 && commentEnd === -1 ) {
				processed += remaining;
				break;
			}

			// comment start but no comment end
			if ( commentStart !== -1 && commentEnd === -1 ) {
				throw 'Illegal HTML - expected closing comment sequence (\'-->\')';
			}

			// comment end but no comment start, or comment end before comment start
			if ( ( commentEnd !== -1 && commentStart === -1 ) || ( commentEnd < commentStart ) ) {
				throw 'Illegal HTML - unexpected closing comment sequence (\'-->\')';
			}

			processed += remaining.substr( 0, commentStart );
			remaining = remaining.substring( commentEnd + 3 );
		}

		return processed;
	};


	TagBuffer = function () {
		this.value = '';
	};

	TagBuffer.prototype = {
		read: function ( char ) {
			var continueBuffering;

			this.value += char;

			console.log( 'buffering "%s" ("%s")', char, this.value );

			// if this could turn out to be a tag, a mustache or a triple return true
			continueBuffering = ( this.value === '<' || this.isPartialMatchOf( A.delimiters[0] ) || this.isPartialMatchOf( A.tripleDelimiters[0] ) );

			console.log( 'continue buffering?', continueBuffering );

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

			if ( !token ) {
				// so it's not a mustache or a triple. how about a tag?
				if ( this.value.charAt( 0 ) === '<' ) {
					token = new TagToken();
				}

				// must be regular text
				else {
					token = new TextToken();
				}
			}

			while ( this.value.length ) {
				token.read( this.value.charAt( 0 ) );
				this.value = this.value.substring( 1 );
			}

			return token;
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
		this.buffer = new TagBuffer();
	};

	TokenStream.prototype = {
		read: function ( char ) {
			var previousToken;

			console.log( 'reading "%s" to token stream. current token:', char, this.currentToken );

			if ( this.currentToken ) {
				console.log( 'sending char "%s" to current token', char );
				if ( this.currentToken.read( char ) ) {
					console.log( 'accepted' );
					return;
				} else {
					console.log( 'rejected' );
					this.currentToken = null;
				}
			}

			// see if the stream could turn out to be a mustache, triple or tag
			if ( !this.buffer.read( char ) ) {
				this.currentToken = this.buffer.convert();

				// if it turns out to be a text token, and the previous token was a text token
				// (i.e. the previous token bugged out on a false positive), merge the two
				previousToken = this.tokens[ this.tokens.length - 1 ];
				if ( this.currentToken instanceof TextToken && previousToken instanceof TextToken ) {
					previousToken.merge( this.currentToken );
					this.currentToken = previousToken;
				} else {
					this.tokens[ this.tokens.length ] = this.currentToken;
				}
			}
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
			console.group( string.charAt( i ) );
			stream.read( string.charAt( i ) );
			console.groupEnd();
			i += 1;
		}

		stream.end();

		return stream;
	};



	TextToken = function () {
		this.value = '';
	};

	TextToken.prototype = {
		read: function ( char ) {
			// if this looks like it could be the start of a tag or an opening delimiter, stop reading
			if ( char === '<' || char === A.delimiters[0].charAt( 0 ) || char === A.tripleDelimiters[0].charAt( 0 ) ) {
				return false;
			}

			this.value += char;
			return true;
		},

		merge: function ( token ) {
			this.value += token.value;
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

	MustacheToken.prototype = {
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



	TripleToken = function () {
		this.value = '';
		this.closingDelimiter = A.tripleDelimiters[1];
	};

	TripleToken.prototype = {
		read: function ( char ) {
			if ( this.sealed ) {
				return false;
			}

			this.value += char;

			if ( this.value.substr( -this.closingDelimiter.length ) === this.closingDelimiter ) {
				this.seal();
			}
		},

		seal: function () {
			// TODO
			this.sealed = true;
		}
	};





	TagToken = function () {
		this.status = null;

		this.tagName = '';
		this.attributes = [];
	};

	TagToken.prototype = {
		read: function ( char ) {
			var response;

			switch ( this.status ) {
				
				// we haven't started yet
				case null:
					return this.appendOpeningBracket( char );

				case 'ambiguous':
					return this.determineStartOrEnd( char );

				case 'buildingTagName':
					return this.appendTagNameChar( char );

				case 'awaitingAttributeName':
					return this.startAttributeName( char );

				case 'buildingAttributeName':
					return this.appendAttributeNameChar( char );

				case 'awaitingAttributeNameOrEquals':
					return this.appendEquals( char );

				case 'awaitingAttributeValue':
					return this.startAttributeValue( char );

				case 'buildingAttributeValue':
					return this.appendAttributeValueChar( char );

				case 'expectingClosingAngleBracket':
					return this.appendClosingBracket( char );

				case 'complete':
					return false;

				default:
					// what are you doing here?
					throw 'Something went wrong!';
			}
		},

		appendOpeningBracket: function ( char ) {
			if ( char === '<' ) {
				this.status = 'ambiguous';
				return true;
			}

			return false;
		},

		determineStartOrEnd: function ( char ) {
			this.status = 'buildingTagName';

			if ( char === '/' ) {
				this.isClosingTag = true;
				return true;
			}

			this.isClosingTag = false;
			return this.appendTagNameChar( char );
		},

		appendTagNameChar: function ( char ) {
			if ( alphanumerics.test( char ) ) {
				this.tagName += char;
				return true;
			}

			// if not an alphanumeric, this character could be
			// 1. whitespace - close tagName, await further input
			if ( whitespace.test( char ) ) {
				this.status = 'awaitingAttributeName';
				return true;
			}

			// 2. '/' - mark tag as self-closing, await '>'
			return this.appendClosingSlash( char ) ||

			// 3. '>' - tag is complete
			this.appendClosingBracket( char );
		},

		startAttributeName: function ( char ) {
			// ignore whitespace
			if ( whitespace.test( char ) ) {
				return true;
			}

			// first character cannot be '='
			if ( char === '=' ) {
				return false;
			}

			if ( this.appendClosingSlash( char ) || this.appendClosingBracket( char ) ) {
				return true;
			}

			this.status = 'buildingAttributeName';
			
			this.nextAttribute = this.attributes[ this.attributes.length ] = {
				name: '',
				value: ''
			};

			return this.appendAttributeNameChar( char );
		},

		appendAttributeNameChar: function ( char ) {

			// whitespace terminates attribute name
			if ( whitespace.test( char ) ) {
				this.status = 'awaitingAttributeNameOrEquals';
				return true;
			}

			// is it an invalid character? invalid chars are ', ", /, =, >
			if ( /['"\/=>]/.test( char ) ) {
				
				this.status = 'awaitingAttributeNameOrEquals';

				return this.appendEquals( char ) ||
						this.appendClosingSlash( char ) ||
						this.appendClosingBracket( char );
				
			}

			this.nextAttribute.name += char;
			return true;
		},


		appendEquals: function ( char ) {
			// ignore whitespace
			if ( whitespace.test( char ) ) {
				return true;
			}

			if ( char === '=' ) {
				this.status = 'awaitingAttributeValue';
				return true;
			}

			// otherwise we are done with this attribute
			delete this.nextAttribute;
			return this.startAttributeName( char );
		},


		startAttributeValue: function ( char ) {
			if ( char === '"' ) {
				this.status = 'buildingAttributeValue';
				this.nextAttribute.doubleQuoted = true;
				return true;
			}

			if ( char === "'" ) {
				this.status = 'buildingAttributeValue';
				this.nextAttribute.singleQuoted = true;
				return true;
			}

			return this.appendAttributeValueChar( char );
		},

		appendAttributeValueChar: function ( char ) {
			if ( this.nextAttribute.doubleQuoted ) {
				// anything goes, except a double quote
				if ( char === '"' ) {
					this.status = 'awaitingAttributeName';
					delete this.nextAttribute.doubleQuoted;
					delete this.nextAttribute;
					return true;
				}

				this.nextAttribute.value += char;
				return true;
			}

			if ( this.nextAttribute.singleQuoted ) {
				// anything goes, except a single quote
				if ( char === "'" ) {
					this.status = 'awaitingAttributeName';
					delete this.nextAttribute.singleQuoted;
					delete this.nextAttribute;
					return true;
				}

				this.nextAttribute.value += char;
				return true;
			}

			// illegal characters: whitespace, ', ", =, /, <, >, `
			if ( !/\s'"=\/<>`/.test( char ) ) {
				this.nextAttribute.value += char;
				return true;
			}

			delete this.nextAttribute;

			return this.appendClosingSlash( char ) || this.appendClosingBracket( char );
		},


		appendClosingSlash: function ( char ) {
			if ( char === '/' ) {
				this.selfClosing = true;
				this.status = 'expectingClosingAngleBracket';
				return true;
			}

			return false;
		},

		appendClosingBracket: function ( char ) {
			if ( char === '>' ) {
				this.status = 'complete';
				return true;
			}

			return false;
		}
	};






	FragmentStub = function () {
		this.children = [];
	};

	FragmentStub.prototype = {
		append: function ( item ) {
			if ( this.childElement ) {
				if ( !this.childElement.append( item ) ) {
					delete this.childElement;
				}
				return;
			}

			if ( item instanceof TagToken ) {
				this.childElement = this.children[ this.children.length ] = new ElementStub();
				
				if ( !this.childElement.append( item ) ) {
					throw 'Something went wrong';
				}
			}

			else {
				this.children[ this.children.length ] = item;
				return;
			}
		},

		toString: function () {
			return this.children.join( '' );
		}
	};

	FragmentStub.fromTokenStream = function ( stream ) {
		var fragStub, tokens, token;

		fragStub = new FragmentStub();
		tokens = stream.tokens;

		while ( tokens.length ) {
			token = tokens.shift();
			fragStub.append( token );
		}

		return fragStub;
	};



	ElementStub = function ( parent ) {
		this.parent = parent;
		this.status = null;
		this.children = [];
	};

	ElementStub.prototype = {
		append: function ( token ) {

			console.log( 'appending token to element with status "%s"', this.status, token );
			
			switch ( this.status ) {

				case null:
					return this.appendOpeningTag( token );

				case 'appending':
					return this.appendToken( token );

				case 'appendingToChild':
					return this.appendTokenToChild( token );

				case 'closed':
					return false;
			}
		},

		appendOpeningTag: function ( token ) {
			
			// check it is a valid opening tag
			if ( !token.tagName || token.isClosingTag ) {
				console.error( token );
				throw 'Illegal tag';
			}

			this.tag = token.tagName;
			this.attributes = token.attributes;

			// if this is a void tag or a self-closing tag, mark it as such
			if ( token.selfClosing ) {
				this.status = 'closed';
			}

			else if ( voidElementNames.indexOf( this.tag ) !== -1 ) {
				this.isVoid = true;
				this.status = 'closed';
			}

			else {
				this.status = 'appending';
			}

			return true;
		},

		appendToken: function ( token ) {
			
			// check first that this isn't a closing tag
			if ( this.isClosedBy( token ) ) {
				this.status = 'closed';
				return true;
			}

			// if it is a text token, add and move on
			if ( !( token instanceof TagToken ) ) {
				this.children[ this.children.length ] = token;
				return true;
			}

			// otherwise it looks like we have a child element
			this.nextStub = new ElementStub( this );
			this.children[ this.children.length ] = this.nextStub;
			this.status = 'appendingToChild';

			return this.nextStub.append( token );

		},

		appendTokenToChild: function ( token ) {
			if ( this.nextStub.append( token ) ) {
				return true;
			} else {
				this.status = 'appending';
				return this.appendToken( token );
			}
		},

		isClosedBy: function ( token ) {
			var implicitClosers, i;

			// if this is a text token, it cannot close an element
			if ( !( token instanceof TagToken ) ) {
				return false;
			}

			// if token is a closing tag with the same name, it closes this element
			if ( token.isClosingTag && token.tagName === this.tag ) {
				return true;
			}

			// if this is an element whose end tag can be omitted if followed by an element
			// which is an 'implicit closer', return true
			implicitClosers = implicitClosersByTagName[ this.tag.toLowerCase() ];
			console.log( 1 );

			if ( implicitClosers ) {
				if ( !token.isClosingTag && implicitClosers.indexOf( token.tagName.toLowerCase() ) !== -1 ) {
					this.parent.appendToken( token );
					return true;
				}
			}
			console.log( 2 );

			// if this is an element that is closed when its parent closes, return true
			if ( closedByParentClose.indexOf( this.tag.toLowerCase() ) !== -1 ) {
				if ( this.parent && this.parent.isClosedBy( token ) ) {
					this.parent.appendToken( token );
					return true;
				}
			}
			console.log( 3 );

			// special cases
			// p element end tag can be omitted when parent closes if it is not an a element
			if ( this.tag.toLowerCase() === 'p' ) {
				if ( this.parent && this.parent.tag.toLowerCase() === 'a' && this.parent.isClosedBy( token ) ) {
					this.parent.appendToken( token );
					return true;
				}
			}
			console.log( 4 );
			

			return false;
		},

		toString: function () {
			var attrString, stringifyAttribute, openingTag, closingTag, contents;

			// TODO

			stringifyAttribute = function ( attribute ) {
				var stringified = ' ';

				stringified += attribute.name;

				// empty string
				if ( !attribute.value ) {
					return stringified;
				}

				stringified += '=';

				// if attribute value doesn't need to be qualified, don't bother
				if ( !/[\s"'=<>`]/.test( attribute.value ) ) {
					stringified += attribute.value;
				}

				// if attribute value has unescaped double quote marks, escape them
				else if ( attribute.value.indexOf( '"' ) !== -1 ) {
					stringified += '"' + attribute.value.replace( /"/g, '&quot;' ) + '"';
				}

				else {
					stringified += '"' + attribute.value + '"';
				}

				return stringified;
			};

			attrString = this.attributes.map( stringifyAttribute ).join( '' );

			openingTag = '<' + this.tag + attrString + ( this.selfClosing && !this.isVoid ? '/>' : '>' );

			if ( this.selfClosing || this.isVoid ) {
				return openingTag;
			}

			contents = this.children.join( '' );
			closingTag = '</' + this.tag + '>';

			return openingTag + contents + closingTag;
		}
	};



	parse = function ( template ) {
		var stream, fragmentStub;

		stream = TokenStream.fromString( template );
		console.log( 'stream:', stream );

		fragmentStub = FragmentStub.fromTokenStream( stream );

		return fragmentStub;
	};



	A.utils.parse = parse;

}( Anglebars ));