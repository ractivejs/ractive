(function ( views ) {
	
	'use strict';


	views.create = function ( model, anglebars, parentNode, contextStack, anchor ) {

		switch ( model.type ) {
			case 'text':
				return new views.Text( model, parentNode, anchor );

			case 'interpolator':
				return new views.Interpolator( model, anglebars, parentNode, contextStack, anchor );

			case 'triple':
				return new views.Triple( model, anglebars, parentNode, contextStack, anchor );

			case 'element':
				return new views.Element( model, anglebars, parentNode, contextStack, anchor );

			case 'section':
				return new views.Section( model, anglebars, parentNode, contextStack, anchor );
		}
	};



	views.Fragment = function ( array, anglebars, parentNode, contextStack, anchor ) {

		var arrayLength, i;

		this.items = [];

		arrayLength = array.length;
		for ( i=0; i<arrayLength; i+=1 ) {
			this.items[ this.items.length ] = views.create( array[i], anglebars, parentNode, contextStack, anchor );
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