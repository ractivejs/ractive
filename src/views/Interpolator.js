(function ( views, utils, doc ) {

	'use strict';

	/*views.Interpolator = function ( model, anglebars, parentNode, contextStack, anchor ) {
		var self = this,
			value,
			formatted,
			data = anglebars.data;

		contextStack = ( contextStack ? contextStack.concat() : [] );
		
		
		this.node = doc.createTextNode( '' );
		this.data = data;
		this.model = model;
		this.contextStack = contextStack;

		data.getKeypath( this, model.partialKeypath, contextStack, function ( keypath ) {
			value = data.get( keypath );
			formatted = anglebars._format( value, model.formatters );

			this.update( formatted );

			this.subscriptionRefs = data.subscribe( keypath, model.level, function ( value ) {
				var formatted = anglebars._format( value, model.formatters );
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
	};*/


	views.Interpolator = Anglebars.view({
		initialize: function () {
			this.node = doc.createTextNode( '' );
			this.parentNode.insertBefore( this.node, this.anchor || null );
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unobserveAll( this.observerRefs );
			}

			utils.remove( this.node );
		},

		update: function ( value ) {
			this.node.data = value;
		}
	});

}( Anglebars.views, Anglebars.utils, document ));

