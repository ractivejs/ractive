define(['Ractive/prototype/shared/makeQuery/sortByItemPosition'],function (sortByItemPosition) {

	'use strict';
	
	return function ( node, otherNode ) {
		var bitmask;
	
		if ( node.compareDocumentPosition ) {
			bitmask = node.compareDocumentPosition( otherNode );
			return ( bitmask & 2 ) ? 1 : -1;
		}
	
		// In old IE, we can piggy back on the mechanism for
		// comparing component positions
		return sortByItemPosition( node, otherNode );
	};

});