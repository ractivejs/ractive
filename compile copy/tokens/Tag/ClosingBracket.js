ClosingBracket = function () {};
ClosingBracket.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		if ( char === '>' ) {
			this.value = '>';
			this.seal();
			return true;
		}

		throw 'Expected ">", received "' + char + '"';
	},

	seal: function () {
		this.sealed = true;
	}
};