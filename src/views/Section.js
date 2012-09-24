(function ( views, utils ) {

	'use strict';

	views.Section = function ( model, anglebars, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formatted,
			data = anglebars.data;

		this.model = model;
		this.contextStack = contextStack || [];
		this.anglebars = anglebars;
		this.data = data;
		this.views = [];
		
		this.parentNode = parentNode;
		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor || null );

		data.getAddress( this, model.keypath, contextStack, function ( address ) {
			unformatted = data.get( address );
			formatted = anglebars.format( unformatted, model.formatters );

			this.update( formatted );

			// subscribe to changes
			this.subscriptionRefs = data.subscribe( address, model.level, function ( value ) {
				var formatted = anglebars.format( value, model.formatters );
				self.update( formatted );
			});
		});
	};

	views.Section.prototype = {
		teardown: function () {
			this.unrender();

			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.anchor );
		},

		unrender: function () {
			// TODO unsubscribe
			while ( this.views.length ) {
				this.views.shift().teardown();
			}
		},

		update: function ( value ) {
			var emptyArray, i;
			
			// treat empty arrays as false values
			if ( utils.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.rendered ) {
						this.unrender();
						this.rendered = false;
						return;
					}
				}

				else {
					if ( !this.rendered ) {
						this.views[0] = new views.Fragment( this.model.children, this.anglebars, this.parentNode, this.contextStack, this.anchor );
						//this.views[0] = this.model.list.render( this.parentNode, this.contextStack, this.anchor );
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
						this.unrender();
						this.rendered = false;
					}

					// if value is an array of hashes, iterate through
					if ( utils.isArray( value ) ) {
						if ( emptyArray ) {
							return;
						}
						
						for ( i=0; i<value.length; i+=1 ) {
							this.views[i] = new views.Fragment( this.model.children, this.anglebars, this.parentNode, this.contextStack.concat( this.address + '.' + i ), this.anchor );
							// this.views[i] = this.model.list.render( this.parentNode, this.contextStack.concat( this.address + '.' + i ), this.anchor );
						}
					}

					// if value is a hash, add it to the context stack and update children
					else {
						this.views[0] = new views.Fragment( this.model.children, this.anglebars, this.parentNode, this.contextStack.concat( this.address ), this.anchor );
						// this.views[0] = this.model.list.render( this.parentNode, this.contextStack.concat( this.address ), this.anchor );
					}

					this.rendered = true;
					break;

				default:

					if ( value && !emptyArray ) {
						if ( !this.rendered ) {
							this.views[0] = new views.Fragment( this.model.children, this.anglebars, this.parentNode, this.contextStack, this.anchor );
							// this.views[0] = this.model.list.render( this.parentNode, this.contextStack, this.anchor );
							this.rendered = true;
						}
					}

					else {
						if ( this.rendered ) {
							this.unrender();
							this.rendered = false;
						}
					}

					// otherwise render if value is truthy, unrender if falsy

			}
		}
	};

}( Anglebars.views, Anglebars.utils ));

