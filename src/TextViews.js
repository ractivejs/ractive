(function ( A ) {

	'use strict';

	var substring, substrings;

	// Substring constructor factory
	substring = A.substring = function ( proto ) {
		var Substring;

		Substring = function ( options ) {
			
			var model, formatters;

			model = this.model = options.model;
			this.anglebars = options.anglebars;
			this.viewmodel = options.anglebars.viewmodel;
			this.parent = options.parent;
			this.contextStack = options.contextStack || [];

			formatters = options.model.formatters;

			// if there is an init method, call it
			this.initialize && this.initialize();

			this.viewmodel.getKeypath( this, model.partialKeypath, options.contextStack, function ( keypath ) {
				var value, self = this;

				value = this.viewmodel.get( keypath );
				this.update( options.anglebars._format( value, formatters ) );

				this.observerRefs = this.viewmodel.observe( keypath, this.model.priority, function ( value ) {
					self.update( options.anglebars._format( value, formatters ) );
				});
			});
		};

		Substring.prototype = proto;

		return Substring;
	};


	// Substring types
	substrings = A.substrings;

	// Plain text
	substrings.Text = function ( options ) {
		this.text = options.model.text;
	};

	substrings.Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Interpolator or Triple
	substrings.Interpolator = substring({
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		bubble: function () {
			this.parent.bubble();
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		toString: function () {
			return this.value || '';
		}
	});

	// Triples are the same as Interpolators in this context
	substrings.Triple = substrings.Interpolator;


	// Section
	substrings.Section = substring({
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
			while ( this.substrings.length ) {
				this.substrings.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.substrings.join( '' );
			this.parent.bubble();
		},

		update: function ( value ) {
			var emptyArray, i, substringsToRemove;

			// treat empty arrays as false values
			if ( A.utils.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
					}
				}

				else {
					if ( !this.length ) {
						this.substrings[0] = new substrings.Fragment( this.model.children, this.anglebars, this, this.contextStack );
						this.length = 1;
					}
				}

				this.value = this.substrings.join( '' );
				this.parent.bubble();

				return;
			}


			// Otherwise we need to work out what sort of section we're dealing with.
			if( typeof value === 'object' ) {
				


				// if value is an array, iterate through
				if ( A.utils.isArray( value ) ) {

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
			return this.value || '';
		}
	});


	// Fragment
	substrings.Fragment = function ( options ) {
		var numItems, i, itemOptions;

		this.parent = options.parent;
		this.items = [];

		itemOptions = {
			anglebars:    options.anglebars,
			parent:       this,
			contextStack: options.contextStack
		};
		
		numItems = options.models.length;
		for ( i=0; i<numItems; i+=1 ) {
			itemOptions.model = this.models[i];
			this.items[ this.items.length ] = substrings.create( itemOptions );
		}

		this.value = this.items.join('');
	};

	substrings.Fragment.prototype = {
		bubble: function () {
			this.value = this.items.join( '' );
			this.parent.bubble();
		},

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		toString: function () {
			return this.value || '';
		}
	};

}( Anglebars ));

