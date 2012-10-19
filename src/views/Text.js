Anglebars.views.Text = function ( model, parentNode, anchor ) {
	this.node = document.createTextNode( model.text );

	// append this.node, either at end of parent element or in front of the anchor (if defined)
	parentNode.insertBefore( this.node, anchor || null );
};

Anglebars.views.Text.prototype = {
	teardown: function () {
		Anglebars.utils.remove( this.node );
	}
};