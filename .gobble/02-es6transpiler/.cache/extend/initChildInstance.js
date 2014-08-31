define(['Ractive/initialise'],function (initialise) {

	'use strict';
	
	return function initChildInstance ( child, Child, options ) {
		if ( child.beforeInit ) {
			child.beforeInit( options );
		}
	
		initialise( child, options );
	};

});