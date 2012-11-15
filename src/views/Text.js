Anglebars.views.Text = function ( options ) {
	this.node = document.createTextNode( options.model.text );
	this.index = options.index;

	// append this.node, either at end of parent element or in front of the anchor (if defined)
	options.parentNode.insertBefore( this.node, options.anchor );
};

Anglebars.views.Text.prototype = {
	teardown: function () {
		Anglebars.utils.remove( this.node );
	},

	firstNode: function () {
		return this.node;
	}
};