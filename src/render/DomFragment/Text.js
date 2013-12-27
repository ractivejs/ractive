define([ 'config/types' ], function ( types ) {

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
			return ( '' + this.descriptor ).replace( lessThan, '&lt;' ).replace( greaterThan, '&gt;' );
		}
	};

	return DomText;

});
