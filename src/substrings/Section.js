Anglebars.substrings.Section = Anglebars.substring({
	initialize: function () {
		this.substrings = [];
	},

	teardown: function () {
		// TODO
	},

	bubble: function () {
		this.value = this.substrings.join( '' );
		this.parent.bubble();
	},

	update: function ( value ) {
		var emptyArray, i;

		// treat empty arrays as false values
		if ( _.isArray( value ) && value.length === 0 ) {
			emptyArray = true;
		}

		// if section is inverted, only check for truthiness/falsiness
		if ( this.model.inverted ) {
			if ( value && !emptyArray ) {
				
				// if section is true, but was previously false, unrender
				// TODO proper teardown
				if ( this.rendered ) {
					this.substrings = [];
					this.rendered = false;
					return;
				}
			}

			else {
				
				// if section is false, but was previously true, render
				if ( !this.rendered ) {

					this.substrings[0] = new Anglebars.substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack );
					this.rendered = true;
					return;
				}
			}

			return;
		}


		// Otherwise we need to work out what sort of section we're dealing with.
		//
		// If it's an object, it could be an array (i.e. multiple iterations) or
		// a hash (i.e. context changes).
		//
		// If not, it's just a straight truthy/falsy check

		if( typeof value === 'object' ) {
			
			// clear everything so we can rebuild it. TODO find a less destructive way
			if ( this.rendered ) {
				this.substrings = [];
				this.rendered = false;
			}

			// if value is an array of hashes, iterate through
			if ( Anglebars.utils.isArray( value ) && !emptyArray ) {
				for ( i=0; i<value.length; i+=1 ) {
					this.substrings[i] = new Anglebars.substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
				}
			}

			// if value is a hash, add it to the context stack and update children
			else {
				this.substrings[0] = new Anglebars.substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath ) );
			}

			this.rendered = true;
		}

		else {

			if ( value && !emptyArray ) {
				if ( !this.rendered ) {
					this.substrings[0] = new Anglebars.substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack );
					this.rendered = true;
				}
			}

			else {
				if ( this.rendered ) {
					// TODO proper teardown
					this.substrings = [];
					this.rendered = false;
				}
			}
		}

		this.value = this.substrings.join( '' );
		this.parent.bubble();
	},

	toString: function () {
		return this.value;
	}
});
