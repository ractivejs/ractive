Solidus = function () {};
Solidus.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		if ( char === '/' ) {
			this.value = '/';
			this.seal();
			return true;
		}

		this.seal();
		return false;
	},

	seal: function () {
		this.sealed = true;
	}
};
