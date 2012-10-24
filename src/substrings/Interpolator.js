Anglebars.substrings.Interpolator = Anglebars.substring({
	initialize: function () {

	},

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
		return this.value;
	}
});

// Triples are the same as Interpolators in this context
Anglebars.substrings.Triple = Anglebars.substrings.Interpolator;

