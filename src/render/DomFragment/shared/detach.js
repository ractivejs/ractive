define( function () {

	'use strict';

	return function () {
		var node = this.node, parentNode;

		if ( node && ( parentNode = node.parentNode ) ) {
			parentNode.removeChild( node );
			return node;
		}
	};

});
