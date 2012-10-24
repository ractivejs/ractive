Anglebars.substrings.Section = Anglebars.substring({
	initialize: function () {
		this.substrings = [];
		this.length = 0;
	},

	teardown: function () {
		this.unrender();

		if ( !this.observerRefs ) {
			this.viewmodel.cancelAddressResolution( this );
		} else {
			this.viewmodel.unobserveAll( this.observerRefs );
		}
	},

	unrender: function () {
		// TODO unsubscribe
		while ( this.substrings.length ) {
			this.substrings.shift().teardown();
		}
	},

	bubble: function () {
		this.value = this.substrings.join( '' );
		this.parent.bubble();
	},

	update: function ( value ) {
		var emptyArray, i, substrings = Anglebars.substrings, substringsToRemove;

		// treat empty arrays as false values
		if ( _.isArray( value ) && value.length === 0 ) {
			emptyArray = true;
		}

		// if section is inverted, only check for truthiness/falsiness
		if ( this.model.inverted ) {
			if ( value && !emptyArray ) {
				if ( this.length ) {
					this.unrender();
					this.length = 0;
					return;
				}
			}

			else {
				if ( !this.length ) {
					this.substrings[0] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack );
					this.length = 1;
					return;
				}
			}

			return;
		}


		// Otherwise we need to work out what sort of section we're dealing with.
		if( typeof value === 'object' ) {
			


			// if value is an array, iterate through
			if ( Anglebars.utils.isArray( value ) ) {

				// if the array is shorter than it was previously, remove items
				if ( value.length < this.length ) {
					substringsToRemove = this.substrings.splice( value.length, this.length - value.length );

					while ( substringsToRemove.length ) {
						substringsToRemove.shift().teardown();
					}
				}

				// otherwise...
				else {

					// first, update existing views
					for ( i=0; i<this.length; i+=1 ) {
						this.viewmodel.update( this.keypath + '.' + i );
					}

					if ( value.length > this.length ) {
					
						// then add any new ones
						for ( i=this.length; i<value.length; i+=1 ) {
							this.substrings[i] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
						}
					}
				}

				this.length = value.length;
			}

			// if value is a hash...
			else {
				// ...then if it isn't rendered, render it, adding this.keypath to the context stack
				// (if it is already rendered, then any children dependent on the context stack
				// will update themselves without any prompting)
				if ( !this.length ) {
					this.substrings[0] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath ) );
					this.length = 1;
				}
			}

			this.rendered = true;

			
			/*// if value is an array of hashes, iterate through
			if ( Anglebars.utils.isArray( value ) ) {
				for ( i=0; i<value.length; i+=1 ) {
					this.substrings[i] = new Anglebars.substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath + '.' + i ) );
				}
			}

			// if value is a hash, add it to the context stack and update children
			else {
				this.substrings[0] = new Anglebars.substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack.concat( this.keypath ) );
			}

			this.rendered = true;*/
		}

		// otherwise render if value is truthy, unrender if falsy
		else {

			if ( value && !emptyArray ) {
				if ( !this.length ) {
					this.substrings[0] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack );
					this.length = 1;
				}
			}

			else {
				if ( this.length ) {
					this.unrender();
					this.length = 0;
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
