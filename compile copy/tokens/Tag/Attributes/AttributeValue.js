tokens.AttributeValue = function () {
	this.tokens = [];
	this.buffer = new MustacheBuffer();

	this.isNull = true;
};

tokens.AttributeValue.prototype = {
	read: function ( char ) {
		var mustacheToken, bufferValue;

		if ( this.sealed ) {
			return false;
		}

		// have we had the = character yet?
		if ( this.isNull ) {
			// ignore whitespace between name and =
			if ( whitespace.test( char ) ) {
				return true;
			}

			// if we have the =, we can read in the value
			if ( char === '=' ) {
				this.isNull = false;
				return true;
			}

			// anything else is an error
			return false;
		}

		
		if ( !this.tokens.length && !this.quoteMark ) {
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

				// still got something left over?
				if ( bufferValue.length ) {
					// '>' - close tag token
					if ( bufferValue.charAt( 0 ) === '>' ) {
						this.seal();
						return false;
					}

					// closing quoteMark - seal value
					if ( bufferValue.charAt( 0 ) === this.quoteMark ) {
						this.currentToken.seal();
						this.seal();
						return true;
					}

					// anything else - create a new token
					this.currentToken = new tokens.AttributeValueToken( this.quoteMark );
					this.currentToken.read( bufferValue.charAt( 0 ) );

					this.tokens[ this.tokens.length ] = this.currentToken;
					bufferValue = bufferValue.substring( 1 );
				}
			}

			return true;
		}

		// otherwise we need to create a new token
		this.currentToken = new tokens.AttributeValueToken( this.quoteMark );

		this.currentToken.read( char );
		this.tokens[ this.tokens.length ] = this.currentToken;

		if ( this.currentToken.sealed ) {
			this.seal();
		}

		return true;
	},

	seal: function () {
		this.sealed = true;
	}
};