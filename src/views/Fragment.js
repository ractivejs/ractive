(function ( views ) {
	
	'use strict';

	views.Fragment = function ( models, anglebars, parentNode, contextStack, anchor ) {

		var numModels, i;

		this.items = [];

		numModels = models.length;
		for ( i=0; i<numModels; i+=1 ) {
			this.items[ this.items.length ] = views.create( models[i], anglebars, parentNode, contextStack, anchor );
		}
	};

	views.Fragment.prototype = {
		teardown: function () {
			
			var i, numItems;

			// TODO unsubscribes
			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}

			delete this.items; // garbage collector, ATTACK!
		}
	};

}( Anglebars.views ));