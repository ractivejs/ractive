define([ 'config/types' ], function ( types ) {

	'use strict';

	var DomText = function ( options, docFrag ) {
		this.type = types.TEXT;
		this.descriptor = options.descriptor;

		if ( docFrag ) {
			this.node = document.createTextNode( options.descriptor );
			this.parentNode = options.parentFragment.parentNode;

			docFrag.appendChild( this.node );
		}
	};

	DomText.prototype = {
		teardown: function ( detach ) {
			if ( detach ) {
				this.node.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		},

		toString: function () {
			return ( '' + this.descriptor ).replace( '<', '&lt;' ).replace( '>', '&gt;' );
		}
	};

	return DomText;

});
