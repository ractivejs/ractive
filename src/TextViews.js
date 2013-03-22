(function ( A ) {

	'use strict';

	var types, isArray, isObject,
		Text, Interpolator, Triple, Section;

	types = A.types;

	isArray = A.isArray;
	isObject = A.isObject;

	A.TextFragment = function ( options ) {
		A._Fragment.call( this, options );
	};

	A.TextFragment.prototype = {
		init: function () {
			this.value = this.items.join('');
		},

		createItem: function ( options ) {
			if ( typeof options.model === 'string' ) {
				return new Text( options.model );
			}

			switch ( options.model.type ) {
				case types.INTERPOLATOR: return new Interpolator( options );
				case types.TRIPLE: return new Triple( options );
				case types.SECTION: return new Section( options );

				default: throw 'Something went wrong in a rather interesting way';
			}
		},


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
		A._Mustache.call( this, options );
	};

	Interpolator.prototype = {
		update: function ( value ) {
			this.value = value;
			this.parent.bubble();
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
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
		A._Mustache.call( this, options );
	};

	Section.prototype = {
		initialize: function () {
			this.fragments = [];
			this.length = 0;
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		unrender: function () {
			while ( this.children.length ) {
				this.children.shift().teardown();
			}
			this.length = 0;
		},

		bubble: function () {
			this.value = this.children.join( '' );
			this.parent.bubble();
		},

		update: function ( value ) {
			A._sectionUpdate.call( this, value );
		},

		createFragment: function ( options ) {
			return new A.TextFragment( options );
		},

		postUpdate: function () {
			this.value = this.fragments.join( '' );
			this.parent.bubble();
		},

		toString: function () {
			return this.fragments.join( '' );
			//return ( this.value === undefined ? '' : this.value );
		}
	};

}( Anglebars ));