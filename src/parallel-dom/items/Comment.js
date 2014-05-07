import types from 'config/types';
import detach from 'parallel-dom/items/shared/detach';

var DomComment = function ( options, docFrag ) {
	this.type = types.COMMENT;
	this.value = options.template.c;
};

DomComment.prototype = {
	detach: detach,

	teardown: function ( destroy ) {
		if ( destroy ) {
			this.detach();
		}
	},

	render: function () {
		return this.node = document.createComment( this.value );
	},

	unrender: function () {
		throw new Error( 'TODO not implemented' );
	},

	firstNode: function () {
		return this.node;
	},

	toString: function () {
		return '<!--' + this.template.c + '-->';
	}
};

export default DomComment;
