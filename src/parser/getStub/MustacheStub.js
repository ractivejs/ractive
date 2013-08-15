var MustacheStub = function ( token, parser ) {
	this.type = ( token.type === TRIPLE ? TRIPLE : token.mustacheType );

	if ( token.ref ) {
		this.ref = token.ref;
	}
	
	if ( token.expression ) {
		this.expr = new ExpressionStub( token.expression );
	}

	parser.pos += 1;
};

MustacheStub.prototype = {
	toJSON: function () {
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
			json.x = this.expr.toJSON();
		}

		this.json = json;
		return json;
	},

	toString: function () {
		// mustaches cannot be stringified
		return false;
	}
};