(function ( views, utils ) {

	'use strict';

	views.Triple = function ( model, anglebars, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formattedHtml,
			data = anglebars.data;

		this.nodes = [];
		this.data = data;
		this.anglebars = anglebars;

		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor || null );

		data.getAddress( this, model.keypath, contextStack, function ( address ) {
			// subscribe to data changes
			this.subscriptionRefs = data.subscribe( address, model.level, function ( value ) {
				var formatted = anglebars.format( value, model.formatters );
				self.update( formatted );
			});

			unformatted = data.get( address );
			formattedHtml = anglebars.format( unformatted, model.formatters );

			this.update( formattedHtml );
		});
	};

	views.Triple.prototype = {
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
				utils.insertBefore( this.anchor, this.nodes[i] );
			}
		}
	};

}( Anglebars.views, Anglebars.utils ));

