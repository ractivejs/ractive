define([ 'config/types' ], function ( types ) {

	'use strict';

	var DomComment = function ( options, docFrag ) {
		this.type = types.COMMENT;
		this.descriptor = options.descriptor;

		if ( docFrag ) {
			this.node = document.createComment( options.descriptor.f );
			this.pNode = options.parentFragment.pNode;

			docFrag.appendChild( this.node );
		}
	};

	DomComment.prototype = {
		detach: function () {
			this.node.parentNode.removeChild( this.node );
			return this.node;
		},

		teardown: function ( destroy ) {
			if ( destroy ) {
				this.detach();
			}
		},

		firstNode: function () {
			return this.node;
		},

		toString: function () {
			return '<!--' + this.descriptor.f + '-->';
		}
	};

	return DomComment;

});