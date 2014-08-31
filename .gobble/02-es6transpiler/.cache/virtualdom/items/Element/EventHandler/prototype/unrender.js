define(['virtualdom/items/Element/EventHandler/shared/genericHandler'],function (genericHandler) {

	'use strict';
	
	return function EventHandler$unrender () {
	
		if ( this.custom ) {
			this.custom.teardown();
		}
	
		else {
			this.node.removeEventListener( this.name, genericHandler, false );
		}
	
		this.hasListener = false;
	
	};

});