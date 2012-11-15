Anglebars.views.Section = Anglebars.view({
	initialize: function () {
		this.views = [];
		this.length = 0; // number of times this section is rendered
	},

	teardown: function () {
		this.unrender();

		if ( !this.observerRefs ) {
			this.viewmodel.cancelAddressResolution( this );
		} else {
			this.viewmodel.unobserveAll( this.observerRefs );
		}

		Anglebars.utils.remove( this.anchor );
	},

	firstNode: function () {
		if ( this.views[0] ) {
			return this.views[0].firstNode();
		}

		return this.parentFragment.findNextNode( this );
	},

	findNextNode: function ( fragment ) {
		if ( this.views[ fragment.index + 1 ] ) {
			return this.views[ fragment.index + 1 ].firstNode();
		} else {
			return this.parentFragment.findNextNode( this );
		}
	},

	unrender: function () {
		while ( this.views.length ) {
			this.views.shift().teardown();
		}
	},

	update: function ( value ) {
		var emptyArray, i, views = Anglebars.views, viewsToRemove, anchor, fragmentOptions;


		fragmentOptions = {
			model:        this.model.children,
			anglebars:    this.anglebars,
			parentNode:   this.parentNode,
			anchor:       this.parentFragment.findNextNode( this ),
			parentSection: this
		};

		// treat empty arrays as false values
		if ( Anglebars.utils.isArray( value ) && value.length === 0 ) {
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
					anchor = this.parentFragment.findNextNode( this );
					
					// no change to context stack in this situation
					fragmentOptions.contextStack = this.contextStack;
					fragmentOptions.index = 0;

					this.views[0] = new views.Fragment( fragmentOptions );
					this.length = 1;
					return;
				}
			}

			return;
		}


		// otherwise we need to work out what sort of section we're dealing with
		
		// if value is an array, iterate through
		if ( Anglebars.utils.isArray( value ) ) {

			// if the array is shorter than it was previously, remove items
			if ( value.length < this.length ) {
				viewsToRemove = this.views.splice( value.length, this.length - value.length );

				while ( viewsToRemove.length ) {
					viewsToRemove.shift().teardown();
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
						// append list item to context stack
						fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
						fragmentOptions.index = i;

						this.views[i] = new views.Fragment( fragmentOptions );
					}
				}
			}

			this.length = value.length;
		}

		// if value is a hash...
		else if ( Anglebars.utils.isObject( value ) ) {
			// ...then if it isn't rendered, render it, adding this.keypath to the context stack
			// (if it is already rendered, then any children dependent on the context stack
			// will update themselves without any prompting)
			if ( !this.length ) {
				// append this section to the context stack
				fragmentOptions.contextStack = this.contextStack.concat( this.keypath );
				fragmentOptions.index = 0;

				this.views[0] = new views.Fragment( fragmentOptions );
				this.length = 1;
			}
		}


		// otherwise render if value is truthy, unrender if falsy
		else {

			if ( value && !emptyArray ) {
				if ( !this.length ) {
					// no change to context stack
					fragmentOptions.contextStack = this.contextStack;
					fragmentOptions.index = 0;

					this.views[0] = new views.Fragment( fragmentOptions );
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
	}
});
