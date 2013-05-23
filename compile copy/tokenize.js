(function ( R, utils ) {
	
	'use strict';

	var whitespace,

		stripHtmlComments,
		stripStandalones,
		stripCommentTokens,
		TokenStream,
		MustacheBuffer,
		
		mustacheTypes;



	utils.tokenize = function ( template ) {
		var stream = TokenStream.fromString( stripHtmlComments( template ) );

		return stripCommentTokens( stripStandalones( stream.tokens ) );
	};
	
	
	// TokenStream generates an array of tokens from an HTML string
	TokenStream = function () {
		this.tokens = [];
		this.buffer = new MustacheBuffer();
	};

	TokenStream.prototype = {
		read: function ( char ) {
			var mustacheToken, bufferValue;

			// if we're building a tag or mustache, send everything to it including delimiter characters
			if ( this.currentToken && this.currentToken.type !== types.TEXT ) {
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


	// MustacheBuffer intercepts characters in the token stream and determines
	// whether they could be a mustache/triple delimiter
	MustacheBuffer = function () {
		this.value = '';
	};

	MustacheBuffer.prototype = {
		read: function ( char ) {
			var continueBuffering;

			this.value += char;

			// if this could turn out to be a tag, a mustache or a triple return true
			continueBuffering = ( this.isPartialMatchOf( R.delimiters[0] ) || this.isPartialMatchOf( R.tripleDelimiters[0] ) );
			return continueBuffering;
		},

		convert: function () {
			var value, mustache, triple, token, getTriple, getMustache;

			// store mustache and triple opening delimiters
			mustache = R.delimiters[0];
			triple = R.tripleDelimiters[0];

			value = this.value;

			getTriple = function () {
				if ( value.indexOf( triple ) === 0 ) {
					return new TripleToken();
				}
			};

			getMustache = function () {
				if ( value.indexOf( mustache ) === 0 ) {
					return new MustacheToken();
				}
			};

			// out of mustache and triple opening delimiters, try to match longest first.
			// if they're the same length then only one will match anyway, unless some
			// plonker has set them to the same thing (which should probably throw an error)
			if ( triple.length > mustache.length ) {
				token = getTriple() || getMustache();
			} else {
				token = getMustache() || getTriple();
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

	


	



	stripHtmlComments = function ( html ) {
		var commentStart, commentEnd, processed;

		processed = '';

		while ( html.length ) {
			commentStart = html.indexOf( '<!--' );
			commentEnd = html.indexOf( '-->' );

			// no comments? great
			if ( commentStart === -1 && commentEnd === -1 ) {
				processed += html;
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

			processed += html.substr( 0, commentStart );
			html = html.substring( commentEnd + 3 );
		}

		return processed;
	};

	stripStandalones = function ( tokens ) {
		var i, current, backOne, backTwo, leadingLinebreak, trailingLinebreak;

		leadingLinebreak = /^\s*\r?\n/;
		trailingLinebreak = /\r?\n\s*$/;

		for ( i=2; i<tokens.length; i+=1 ) {
			current = tokens[i];
			backOne = tokens[i-1];
			backTwo = tokens[i-2];

			// if we're at the end of a [text][mustache][text] sequence...
			if ( current.type === types.TEXT && ( backOne.type !== types.TAG ) && backTwo.type === types.TEXT ) {
				// ... and the mustache is a standalone (i.e. line breaks either side)...
				if ( trailingLinebreak.test( backTwo.value ) && leadingLinebreak.test( current.value ) ) {
					// ... then we want to remove the whitespace after the first line break
					// if the mustache wasn't a triple or interpolator or partial
					if ( backOne.type !== types.INTERPOLATOR && backOne.type !== types.TRIPLE ) {
						backTwo.value = backTwo.value.replace( trailingLinebreak, '\n' );
					}

					// and the leading line break of the second text token
					current.value = current.value.replace( leadingLinebreak, '' );

					// if that means the current token is now empty, we should remove it
					if ( current.value === '' ) {
						tokens.splice( i--, 1 ); // splice and decrement
					}
				}
			}
		}

		return tokens;
	};

	stripCommentTokens = function ( tokens ) {
		var i, current, previous, next;

		for ( i=0; i<tokens.length; i+=1 ) {
			current = tokens[i];
			previous = tokens[i-1];
			next = tokens[i+1];

			// if the current token is a comment, remove it...
			if ( current.type === types.COMMENT ) {
				
				tokens.splice( i, 1 ); // remove comment token

				// ... and see if it has text nodes either side, in which case
				// they can be concatenated
				if ( previous && next ) {
					if ( previous.type === types.TEXT && next.type === types.TEXT ) {
						previous.value += next.value;
						
						tokens.splice( i, 1 ); // remove next token
					}
				}

				i -= 1; // decrement i to account for the splice(s)
			}
		}

		return tokens;
	};

	types = utils.types;
	whitespace = /\s/;
	mustacheTypes = {
		'#': types.SECTION,
		'^': types.INVERTED,
		'/': types.CLOSING,
		'>': types.PARTIAL,
		'!': types.COMMENT,
		'&': types.INTERPOLATOR
	};
	


}( Ractive, utils ));