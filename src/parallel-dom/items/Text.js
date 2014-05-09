import types from 'config/types';
import escapeHtml from 'utils/escapeHtml';
import detach from 'parallel-dom/items/shared/detach';

var Text = function ( options, docFrag ) {
	this.type = types.TEXT;
	this.text = options.template;
};

Text.prototype = {
	detach: detach,

	render: function () {
		return this.node = document.createTextNode( this.text );
	},

	unrender: function () {
		if ( !this.node ) {
			throw new Error( 'Attempted to unrender an item that had not been rendered' );
		}

		this.node.parentNode.removeChild( this.node );
	},

	teardown: function ( destroy ) {
		if ( destroy ) {
			this.detach();
		}
	},

	firstNode: function () {
		return this.node;
	},

	toString: function ( escape ) {
		return escape ? escapeHtml( this.text ) : this.text;
	}
};

export default Text;
