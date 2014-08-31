define(['utils/matches'],function (matches) {

	'use strict';
	
	return function ( selector ) {
		if ( matches( this.node, selector ) ) {
			return this.node;
		}
	
		if ( this.fragment && this.fragment.find ) {
			return this.fragment.find( selector );
		}
	};

});