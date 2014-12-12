import { TEXT } from 'config/types';
import { escapeHtml } from 'utils/html';
import detach from './shared/detach';

var Text = function ( options ) {
	this.type = TEXT;
	this.text = options.template;
};

Text.prototype = {
	detach: detach,

	firstNode: function () {
		return this.node;
	},

	render: function () {
		if ( !this.node ) {
			this.node = document.createTextNode( this.text );
		}

		return this.node;
	},

	toString: function ( escape ) {
		return escape ? escapeHtml( this.text ) : this.text;
	},

	unrender: function ( shouldDestroy ) {
		if ( shouldDestroy ) {
			return this.detach();
		}
	}
};

export default Text;
