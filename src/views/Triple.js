Anglebars.views.Triple = Anglebars.view({
	initialize: function () {
		this.nodes = [];

		this.tripleAnchor = Anglebars.utils.createAnchor();
		this.parentNode.insertBefore( this.tripleAnchor, this.anchor || null );
	},

	teardown: function () {
		
		var i, numNodes;
		
		// TODO unsubscribes
		numNodes = this.nodes.length;
		for ( i=0; i<numNodes; i+=1 ) {
			Anglebars.utils.remove( this.nodes[i] );
		}


		if ( !this.observerRefs ) {
			this.data.cancelAddressResolution( this );
		} else {
			this.data.unobserveAll( this.observerRefs );
		}

		Anglebars.utils.remove( this.anchor );
	},

	update: function ( value ) {
		var numNodes, i, utils = Anglebars.utils;

		if ( utils.isEqual( this.value, value ) ) {
			return;
		}

		// remove existing nodes
		numNodes = this.nodes.length;
		for ( i=0; i<numNodes; i+=1 ) {
			utils.remove( this.nodes[i] );
		}

		// get new nodes
		this.nodes = utils.getNodeArrayFromHtml( value, false );

		numNodes = this.nodes.length;
		for ( i=0; i<numNodes; i+=1 ) {
			this.parentNode.insertBefore( this.nodes[i], this.tripleAnchor );
		}
	}
});
