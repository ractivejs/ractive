Anglebars.substrings.Section = Anglebars.substring({
	initialize: function () {
		this.substrings = [];
	},

	bubble: function () {
		this.value = this.substrings.join( '' );
		this.parent.bubble();
	},

	teardown: function () {
		// TODO
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
				if ( this.rendered ) {
					this.substrings = [];
					this.rendered = false;
					return;
				}
			}

			else {
				
				// if section is false, but was previously true, render
				if ( !this.rendered ) {

					this.substrings[0] = [];
					
					// create substrings for all children
					for ( i=0; i<this.model.children.length; i+=1 ) {
						this.substrings[0][i] = Anglebars.substrings.create( this.model.children[i], this.anglebars, this, this.contextStack );
					}
					this.rendered = true;
					return;
				}
			}

			return;
		}


		// otherwise we need to work out what sort of section we're dealing with
		if( typeof value === 'object' ) {
			
			// clear everything so we can rebuild it. TODO find a less destructive way
			if ( this.rendered ) {
				this.substrings = [];
				this.rendered = false;
			}

			// if value is an array of hashes, iterate through
			if ( Anglebars.utils.isArray( value ) && !emptyArray ) {
				for ( i=0; i<value.length; i+=1 ) {
					this.substrings[i] = [];

					for ( j=0; j<this.model.children.length; j+=1 ) {
						this.substrings[i][j] = Anglebars.substrings.create( this.model.children[j], this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
					}
				}
			}

			// if value is a hash, add it to the context stack and update children
			else {
				this.substrings[0] = [];

				// create substrings for all children
				for ( i=0; i<this.model.children.length; i+=1 ) {
					this.substrings[0][i] = Anglebars.substrings.create( this.model.children[i], this.anglebars, this, this.contextStack.concat( this.keypath ) );
				}
			}

			this.rendered = true;
		}

		else {

			if ( value && !emptyArray ) {
				if ( !this.rendered ) {

					this.substrings[0] = [];

					for ( i=0; i<this.model.children.length; i+=1 ) {
						this.substrings[0][i] = Anglebars.substrings.create( this.model.children[i], this.anglebars, this, this.contextStack );
					}
					this.rendered = true;
				}
			}

			else {
				if ( this.rendered ) {
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
