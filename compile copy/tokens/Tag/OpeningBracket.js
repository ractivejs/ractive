OpeningBracket = function () {};
OpeningBracket.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		if ( char === '<' ) {
			this.value = '<';
			this.seal();
			return true;
		}

		throw 'Expected "<", saw "' + char + '"';
	},

	seal: function () {
		this.sealed = true;
	}
};