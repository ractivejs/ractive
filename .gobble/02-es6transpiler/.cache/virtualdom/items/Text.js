define(['config/types','utils/escapeHtml','virtualdom/items/shared/detach'],function (types, escapeHtml, detach) {

	'use strict';
	
	var Text = function ( options ) {
		this.type = types.TEXT;
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
	
	return Text;

});