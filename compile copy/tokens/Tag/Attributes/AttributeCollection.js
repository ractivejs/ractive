tokens.AttributeCollection = function () {
	this.items = [];
};

tokens.AttributeCollection.prototype = {
	read: function ( char ) {
		if ( this.sealed ) {
			return false;
		}

		// are we currently building an attribute?
		if ( this.nextItem ) {
			// can it take this character?
			if ( this.nextItem.read( char ) ) {
				return true;
			}
		}

		// ignore whitespace before attributes
		if ( whitespace.test( char ) ) {
			return true;
		}

		// if not, start a new attribute
		this.nextItem = new Attribute();

		// will it accept this character? if so add the new attribute
		if ( this.nextItem.read( char ) ) {
			this.items[ this.items.length ] = this.nextItem;
			return true;
		}

		// if not, we're done here
		this.seal();
		return false;
	},

	seal: function () {
		this.sealed = true;
	}
};