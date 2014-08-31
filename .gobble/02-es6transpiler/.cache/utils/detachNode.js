define(function () {

	'use strict';
	
	return function detachNode ( node ) {
		if ( node && node.parentNode ) {
			node.parentNode.removeChild( node );
		}
	
		return node;
	};

});