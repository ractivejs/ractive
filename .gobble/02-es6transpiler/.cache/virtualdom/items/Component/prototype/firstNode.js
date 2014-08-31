define(function () {

	'use strict';
	
	return function Component$firstNode () {
		if ( this.rendered ) {
			return this.instance.fragment.firstNode();
		}
	
		return null;
	};

});