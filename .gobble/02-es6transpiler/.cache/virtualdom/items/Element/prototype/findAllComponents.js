define(function () {

	'use strict';
	
	return function ( selector, query ) {
		if ( this.fragment ) {
			this.fragment.findAllComponents( selector, query );
		}
	};

});