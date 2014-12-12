import { COMMENT } from 'config/types';
import detach from './shared/detach';

var Comment = function ( options ) {
	this.type = COMMENT;
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
