(function ( substrings ) {

	substrings.Section = function ( model, anglebars, parent, contextStack ) {
		
		this.contextStack = contextStack;
		this.anglebars = anglebars;
		this.data = anglebars.data;

		this.substrings = [];

		this.data.getAddress( this, this.keypath, contextStack, function ( address ) {
			var value, formatted, self = this;

			value = this.data.get( this.address );
			formatted = this.anglebars.format( value, this.formatters ); // TODO is it worth storing refs to keypath and formatters on the substring?

			this.update( formatted );

			this.subscriptionRefs = this.data.subscribe( this.address, this.model.level, function ( value ) {
				var formatted = self.anglebars.format( value, self.model.formatters );
				self.update( formatted );
				self.bubble();
			});
		});
	};

	substrings.Section.prototype = {
		bubble: function () {
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
					if ( this.rendered ) {
						this.substrings = [];
						this.rendered = false;
						return;
					}
				}

				else {
					if ( !this.rendered ) {
						this.substrings[0] = substrings.create( this.model.list, this.anglebars, this, this.contextStack );
						this.rendered = true;
						return;
					}
				}

				return;
			}


			// otherwise we need to work out what sort of section we're dealing with
			switch ( typeof value ) {
				case 'object':

					if ( this.rendered ) {
						this.substrings = [];
						this.rendered = false;
					}

					// if value is an array of hashes, iterate through
					if ( _.isArray( value ) && !emptyArray ) {
						for ( i=0; i<value.length; i+=1 ) {
							this.substrings[i] = this.model.list.getEvaluator( this, this.contextStack.concat( this.address + '.' + i ) );
						}
					}

					// if value is a hash, add it to the context stack and update children
					else {
						this.substrings[0] = this.section.list.render( this.parentNode, this.contextStack.concat( this.address ), this.anchor );
					}

					this.rendered = true;
					break;

				default:

					if ( value && !emptyArray ) {
						if ( !this.rendered ) {
							this.substrings[0] = this.model.list.getEvaluator( this, this.contextStack );
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
		},

		toString: function () {
			return this.substrings.join( '' );
		}
	};

}( Anglebars.substrings ));

