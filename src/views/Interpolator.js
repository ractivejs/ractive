(function ( views, utils, doc ) {

	'use strict';

	views.Interpolator = function ( model, anglebars, parentNode, contextStack, anchor ) {
		var self = this,
			value,
			formatted,
			data = anglebars.data;

		contextStack = ( contextStack ? contextStack.concat() : [] );
		
		
		this.node = doc.createTextNode( '' );
		this.data = data;
		this.keypath = model.keypath;
		this.contextStack = contextStack;

		data.getAddress( this, model.keypath, contextStack, function ( address ) {
			value = data.get( address );
			formatted = anglebars.format( value, model.formatters );

			this.update( formatted );

			this.subscriptionRefs = data.subscribe( address, model.level, function ( value ) {
				var formatted = anglebars.format( value, model.formatters );
				console.log( 'Interpolator:', address, value );
				self.update( formatted );
			});
		});
		

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Interpolator.prototype = {
		teardown: function () {
			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.node );
		},

		update: function ( value ) {
			this.node.data = value;
		}
	};

}( Anglebars.views, Anglebars.utils, document ));

