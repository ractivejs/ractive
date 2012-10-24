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
		if ( !this.subscriptionRefs ) {
			this.viewmodel.cancelAddressResolution( this );
		} else {
			this.viewmodel.unsubscribeAll( this.subscriptionRefs );
		}
	},

	toString: function () {
		return this.value;
	}
});

// Triples are the same as Interpolators in this context
Anglebars.substrings.Triple = Anglebars.substrings.Interpolator;

