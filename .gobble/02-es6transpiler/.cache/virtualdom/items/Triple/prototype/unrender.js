define(['utils/detachNode'],function (detachNode) {

	'use strict';
	
	return function Triple$unrender ( shouldDestroy ) {
		if ( this.rendered && shouldDestroy ) {
			this.nodes.forEach( detachNode );
			this.rendered = false;
		}
	
		// TODO update live queries
	};

});