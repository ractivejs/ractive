import types from 'config/types';
import detach from 'parallel-dom/items/shared/detach';

var DomText, lessThan, greaterThan;
lessThan = /</g;
greaterThan = />/g;

DomText = function ( options, docFrag ) {
	this.type = types.TEXT;
	this.text = options.template;
	this.escaped = ( '' + this.text ).replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
};

DomText.prototype = {
	detach: detach,

	reassign: function () {}, //no-op

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

	toString: function () {
		return this.escaped;
	}
};

export default DomText;
