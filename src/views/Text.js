(function ( views, utils, doc ) {

	'use strict';

	views.Text = function ( model, parentNode, anchor ) {
		this.node = doc.createTextNode( model.text );

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Text.prototype = {
		teardown: function () {
			utils.remove( this.node );
		}
	};

}( Anglebars.views, Anglebars.utils, document ));

