define(function () {

	'use strict';
	
	return function Fragment$firstNode () {
		if ( this.items && this.items[0] ) {
			return this.items[0].firstNode();
		}
	
		return null;
	};

});