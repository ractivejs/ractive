// Plain text
var DomComment = function ( options, docFrag ) {
	this.type = COMMENT;
	this.descriptor = options.descriptor;

	if ( docFrag ) {
		this.node = doc.createComment( options.descriptor.f );
		this.parentNode = options.parentFragment.parentNode;

		docFrag.appendChild( this.node );
	}
};

DomComment.prototype = {
	teardown: function ( detach ) {
		if ( detach ) {
			this.node.parentNode.removeChild( this.node );
		}
	},

	firstNode: function () {
		return this.node;
	},

	toString: function () {
		return '<!--' + this.descriptor.f + '-->';
	}
};