(function ( views, utils ) {

	'use strict';

	/*views.Triple = function ( model, anglebars, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formattedHtml,
			data = anglebars.data;

		this.nodes = [];
		this.data = data;
		this.model = model;
		this.anglebars = anglebars;

		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor || null );

		data.getKeypath( this, model.partialKeypath, contextStack, function ( keypath ) {
			// subscribe to data changes
			this.subscriptionRefs = data.subscribe( keypath, model.level, function ( value ) {
				var formatted = anglebars._format( value, model.formatters );
				self.update( formatted );
			});

			unformatted = data.get( keypath );
			formattedHtml = anglebars._format( unformatted, model.formatters );

			this.update( formattedHtml );
		});
	};*/

	views.Triple = Anglebars.view({
		initialize: function () {
			this.nodes = [];

			this.tripleAnchor = utils.createAnchor();
			this.parentNode.insertBefore( this.tripleAnchor, this.anchor || null );
		},

		teardown: function () {
			
			var i, numNodes;
			
			// TODO unsubscribes
			numNodes = this.nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				utils.remove( this.nodes[i] );
			}


			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.anchor );
		},

		update: function ( value ) {
			var numNodes, i;

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

}( Anglebars.views, Anglebars.utils ));

