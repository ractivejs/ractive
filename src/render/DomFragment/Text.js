define([
	'config/types',
	'render/DomFragment/shared/detach'
], function (
	types,
	detach
) {

	'use strict';

	var DomText, lessThan, greaterThan;

	lessThan = /</g;
	greaterThan = />/g;

	DomText = function ( options, docFrag ) {
		this.type = types.TEXT;
		this.descriptor = options.descriptor;

		if ( docFrag ) {
			this.node = document.createTextNode( options.descriptor );
			docFrag.appendChild( this.node );
		}
	};

	DomText.prototype = {
		detach: detach,

		teardown: function ( destroy ) {
			if ( destroy ) {
				this.detach();
			}
		},

		firstNode: function () {
			return this.node;
		},

		toString: function () {
			return ( '' + this.descriptor ).replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
		}
	};

	return DomText;

});
