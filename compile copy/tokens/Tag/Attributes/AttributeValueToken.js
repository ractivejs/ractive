tokens.AttributeValueToken = function ( quoteMark ) {
	this.type = types.ATTR_VALUE_TOKEN;

	this.quoteMark = quoteMark || '';
	this.value = '';
};

tokens.AttributeValueToken.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		if ( char === this.quoteMark ) {
			this.seal();
			return true;
		}

		// within quotemarks, anything goes
		if ( this.quoteMark ) {
			this.value += char;
			return true;
		}

		// without quotemarks, the following characters are invalid: whitespace, ", ', =, <, >, `
		if ( /[\s"'=<>`]/.test( char ) ) {
			this.seal();
			return false;
		}

		this.value += char;
		return true;
	},

	seal: function () {
		this.sealed = true;
	}
};