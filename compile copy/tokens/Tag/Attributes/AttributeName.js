tokens.AttributeName = function () {};

tokens.AttributeName.prototype = {
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