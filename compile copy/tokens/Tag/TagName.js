TagName = function () {};
TagName.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		// first char must be a letter
		if ( !this.value ) {
			if ( /[a-zA-Z]/.test( char ) ) {
				this.value = char;
				return true;
			}
		}

		// subsequent characters can be letters, numbers or hyphens
		if ( /[a-zA-Z0-9\-]/.test( char ) ) {
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