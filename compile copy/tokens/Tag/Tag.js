tokens.Tag = function () {
	this.type = types.TAG;

	this.openingBracket     = new tokens.OpeningBracket();
	this.closingTagSolidus  = new tokens.Solidus();
	this.tagName            = new tokens.TagName();
	this.attributes         = new tokens.AttributeCollection();
	this.selfClosingSolidus = new tokens.Solidus();
	this.closingBracket     = new tokens.ClosingBracket();
};

tokens.Tag.prototype = {
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