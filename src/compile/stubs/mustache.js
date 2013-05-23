(function ( stubs ) {

	var MustacheStub, SectionStub;

	stubs.mustache = function ( parser, priority, preserveWhitespace ) {
		var next = parser.next();

		if ( next.type === MUSTACHE || next.type === TRIPLE ) {
			if ( next.mustacheType === SECTION || next.mustacheType === INVERTED ) {
				return new SectionStub( next, parser, priority, preserveWhitespace );				
			}

			return new MustacheStub( next, parser, priority );
		}

		return null;
	};


	MustacheStub = function ( token, parser, priority ) {
		this.type = ( token.type === TRIPLE ? TRIPLE : token.mustacheType );

		if ( token.ref ) {
			this.ref = token.ref;
		}
		
		if ( token.expression ) {
			this.expr = stubs.expression( token.expression );
		}
		
		this.priority = priority;

		parser.pos += 1;
	};

	MustacheStub.prototype = {
		toJson: function () {
			var json;

			if ( this.json ) {
				return this.json;
			}

			json = {
				t: this.type
			};

			if ( this.ref ) {
				json.r = this.ref;
			}

			if ( this.expr ) {
				json.x = this.expr.toJson();
			}

			if ( this.priority ) {
				json.p = this.priority;
			}

			this.json = json;
			return json;
		},

		toString: function () {
			// mustaches cannot be stringified
			return false;
		}
	};


	SectionStub = function ( firstToken, parser, priority, preserveWhitespace ) {
		var next;

		this.ref = firstToken.ref;
		this.indexRef = firstToken.indexRef;
		this.priority = priority || 0;

		this.inverted = ( firstToken.mustacheType === INVERTED );

		if ( firstToken.expression ) {
			this.expr = stubs.expression( firstToken.expression );
		}

		parser.pos += 1;

		this.items = [];
		next = parser.next();

		// TODO how do we close expression sections?!
		while ( next ) {
			if ( next.mustacheType === CLOSING && ( ( next.ref === this.ref ) || ( next.expr && this.expr ) ) ) {
				parser.pos += 1;
				break;
			}

			this.items[ this.items.length ] = stubs.item( parser, this.priority + 1, preserveWhitespace );
			next = parser.next();
		}
	};

	SectionStub.prototype = {
		toJson: function ( noStringify ) {
			var json, str, i, len, itemStr;

			if ( this.json ) {
				return this.json;
			}

			json = { t: SECTION };

			if ( this.ref ) {
				json.r = this.ref;
			}

			if ( this.indexRef ) {
				json.i = this.indexRef;
			}

			if ( this.inverted ) {
				json.n = true;
			}

			if ( this.expr ) {
				json.x = this.expr.toJson();
			}

			if ( this.items.length ) {
				json.f = stubUtils.jsonify( this.items, noStringify );
			}

			if ( this.priority ) {
				json.p = this.priority;
			}

			this.json = json;
			return json;
		},

		toString: function () {
			// sections cannot be stringified
			return false;
		}
	};

}( stubs ));