var SectionStub = function ( firstToken, parser, preserveWhitespace ) {
	var next;

	this.ref = firstToken.ref;
	this.indexRef = firstToken.indexRef;

	this.inverted = ( firstToken.mustacheType === INVERTED );

	if ( firstToken.expression ) {
		this.expr = new ExpressionStub( firstToken.expression );
	}

	parser.pos += 1;

	this.items = [];
	next = parser.next();

	while ( next ) {
		if ( next.mustacheType === CLOSING ) {
			if ( ( next.ref.trim() === this.ref ) || this.expr ) {
				parser.pos += 1;
				break;
			}

			else {
				throw new Error( 'Could not parse template: Illegal closing section' );
			}
		}

		this.items[ this.items.length ] = getItem( parser, preserveWhitespace );
		next = parser.next();
	}
};

SectionStub.prototype = {
	toJSON: function ( noStringify ) {
		var json;

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
			json.x = this.expr.toJSON();
		}

		if ( this.items.length ) {
			json.f = jsonifyStubs( this.items, noStringify );
		}

		this.json = json;
		return json;
	},

	toString: function () {
		// sections cannot be stringified
		return false;
	}
};