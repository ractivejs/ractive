tokens.Mustache = function () {
	this.value = '';
	this.openingDelimiter = R.delimiters[0];
	this.closingDelimiter = R.delimiters[1];

	this.minLength = this.openingDelimiter.length + this.closingDelimiter.length;
};

tokens.Triple = function () {
	this.value = '';
	this.openingDelimiter = R.tripleDelimiters[0];
	this.closingDelimiter = R.tripleDelimiters[1];

	this.minLength = this.openingDelimiter.length + this.closingDelimiter.length;

	this.type = types.TRIPLE;
};

tokens.Mustache.prototype = tokens.Triple.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		this.value += char;

		if ( ( this.value.length >= this.minLength ) && this.value.substr( -this.closingDelimiter.length ) === this.closingDelimiter ) {
			this.seal();
		}

		return true;
	},

	seal: function () {
		var trimmed, firstChar, identifiers, pattern, conditionalPattern, match;

		if ( this.sealed ) {
			return;
		}

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

		// do we have a named index?
		if ( this.type === types.SECTION ) {
			pattern = /:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)$/;
			match = pattern.exec( trimmed );

			if ( match ) {
				this.i = match[1];
				trimmed = trimmed.substr( 0, trimmed.length - match[0].length );
			}
		}

		// get reference and any modifiers
		identifiers = trimmed.split( '|' );

		this.ref = identifiers.shift().trim();

		// Is this a conditional?
		conditionalPattern = /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\?\s*([^\:\s]*)\s*:\s*([^\.\s]*)/;
		if ( match = conditionalPattern.exec( this.ref ) ) {
			this.ref = match[1];
			this.conditionals = [ match[2], match[3] ];
		}

		// Still got some identifiers? They must be modifiers
		if ( identifiers.length ) {
			this.modifiers = identifiers.map( function ( name ) {
				return name.trim();
			});
		}

		// TODO
		this.sealed = true;
	},

	changeDelimiters: function ( str ) {
		var delimiters, newDelimiters;

		newDelimiters = /\=\s*([^\s=]+)\s+([^\s=]+)\s*=/.exec( str );
		delimiters = ( this.type === types.TRIPLE ? R.tripleDelimiters : R.delimiters );

		delimiters[0] = newDelimiters[1];
		delimiters[1] = newDelimiters[2];
	}
};