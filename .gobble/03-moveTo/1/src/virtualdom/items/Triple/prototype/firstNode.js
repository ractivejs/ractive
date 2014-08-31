define(function () {

	'use strict';
	
	return function Triple$firstNode () {
		if ( this.rendered && this.nodes[0] ) {
			return this.nodes[0];
		}
	
		return this.parentFragment.findNextNode( this );
	};

});