(function ( utils ) {

	'use strict';

	var Text, Interpolator, Triple, Section;

	utils.TextFragment = function TextFragment ( options ) {
		utils.Fragment.call( this, options );
	};

	utils.TextFragment.prototype = {
		createItem: function ( options ) {
			if ( typeof options.descriptor === 'string' ) {
				return new Text( options.descriptor );
			}

			switch ( options.descriptor.t ) {
				case INTERPOLATOR: return new Interpolator( options );
				case TRIPLE: return new Triple( options );
				case SECTION: return new Section( options );

				default: throw 'Something went wrong in a rather interesting way';
			}
		},


		bubble: function () {
			this.value = this.getValue();
			this.owner.bubble();
		},

		teardown: function () {
			var numItems, i;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}
		},

		getValue: function () {
			var value;

			if ( this.items.length === 1 ) {
				value = this.items[0].value;
				if ( value !== undefined ) {
					return value;
				}
			}

			return this.toString();
		},

		toString: function () {
			// TODO refactor this... value should already have been calculated? or maybe not. Top-level items skip the fragment and bubble straight to the attribute...
			// argh, it's confusing me
			return this.items.join( '' );
		}
	};



	// Plain text
	Text = function ( text ) {
		this.text = text;
	};

	Text.prototype = {
		toString: function () {
			return this.text;
		},

		teardown: function () {} // no-op
	};


	// Mustaches

	// Interpolator or Triple
	Interpolator = function ( options ) {
		utils.Mustache.call( this, options );

		// if this initialised without a keypath, and it's a conditional,
		// we need to use the 'if false' value
		if ( this.cond && !this.keypath ) {
			this.update( false );
		}
	};

	Interpolator.prototype = {
		update: utils.Mustache.prototype.update,
		resolve: utils.Mustache.prototype.resolve,
		evaluate: utils.Mustache.prototype.evaluate,

		render: function ( value ) {
			this.value = value;
			this.parentFragment.bubble();
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				utils.cancelKeypathResolution( this.root, this );
			} else {
				utils.unregisterDependant( this.root, this.keypath, this, this.descriptor.p || 0 );
			}
		},

		toString: function () {
			return ( this.value === undefined ? '' : this.value );
		}
	};

	// Triples are the same as Interpolators in this context
	Triple = Interpolator;


	// Section
	Section = function ( options ) {
		this.fragments = [];
		this.length = 0;

		utils.Mustache.call( this, options );
	};

	Section.prototype = {
		update: utils.Mustache.prototype.update,
		resolve: utils.Mustache.prototype.resolve,
		evaluate: utils.Mustache.prototype.evaluate,

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				utils.cancelKeypathResolution( this.root, this );
			} else {
				utils.unregisterDependant( this.root, this.keypath, this, this.descriptor.p || 0 );
			}
		},

		unrender: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.fragments.join( '' );
			this.parentFragment.bubble();
		},

		render: function ( value ) {
			utils.sectionUpdate.call( this, value );

			//this.value = this.fragments.join( '' );
			this.parentFragment.bubble();
		},

		createFragment: function ( options ) {
			return new utils.TextFragment( options );
		},

		toString: function () {
			return this.fragments.join( '' );
			//return ( this.value === undefined ? '' : this.value );
		}
	};

}( utils ));