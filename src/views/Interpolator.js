Anglebars.views.Interpolator = Anglebars.view({
	initialize: function () {
		this.node = document.createTextNode( '' );

		this.parentNode.insertBefore( this.node, this.anchor || null );
	},

	teardown: function () {
		if ( !this.observerRefs ) {
			this.viewmodel.cancelAddressResolution( this );
		} else {
			this.viewmodel.unobserveAll( this.observerRefs );
		}

		Anglebars.utils.remove( this.node );
	},

	update: function ( value ) {
		this.node.data = value;
	},

	firstNode: function () {
		return this.node;
	}
});