Anglebars.views.Interpolator = Anglebars.view({
	initialize: function () {
		this.node = document.createTextNode( '' );
		this.parentNode.insertBefore( this.node, this.anchor || null );
	},

	teardown: function () {
		if ( !this.observerRefs ) {
			this.data.cancelAddressResolution( this );
		} else {
			this.data.unobserveAll( this.observerRefs );
		}

		Anglebars.utils.remove( this.node );
	},

	update: function ( value ) {
		this.node.data = value;
	}
});