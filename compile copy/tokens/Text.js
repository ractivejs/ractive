tokens.Text = function () {
	this.type = types.TEXT;
	this.value = '';
};

tokens.Text.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		// this can be anything except a '<'
		if ( char === '<' ) {
			return false;
		}

		this.value += char;
		return true;
	},

	seal: function () {
		this.sealed = true;
	}
};