import types from 'config/types';
import noop from 'utils/noop';
import detach from 'virtualdom/items/shared/detach';

var Comment = function ( options ) {
	this.type = types.COMMENT;
	this.value = options.template.c;
};

Comment.prototype = {
	detach: detach,

	firstNode: function () {
		return this.node;
	},

	render: function () {
		if ( !this.node ) {
			this.node = document.createComment( this.value );
		}

		return this.node;
	},

	teardown: noop,

	toString: function () {
		return '<!--' + this.value + '-->';
	},

	unrender: function ( shouldDestroy ) {
		if ( shouldDestroy ) {
			this.node.parentNode.removeChild( this.node );
		}
	}
};

export default Comment;
