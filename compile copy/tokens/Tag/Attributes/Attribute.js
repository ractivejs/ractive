tokens.Attribute = function () {
	this.name = new tokens.AttributeName();
	this.value = new tokens.AttributeValue();
};

tokens.Attribute.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		// can we append this character to the attribute name?
		if ( this.name.read( char ) ) {
			return true;
		}
		
		// if not, only continue if we had a name in the first place
		if ( !this.name.value ) {
			this.seal();
			return false;
		}

		// send character to this.value
		if ( this.value.read( char ) ) {
			return true;
		}
		
		// rejected? okay, we're done
		this.seal();
		return false;
	},

	seal: function () {
		// TODO
		this.sealed = true;
	}
};