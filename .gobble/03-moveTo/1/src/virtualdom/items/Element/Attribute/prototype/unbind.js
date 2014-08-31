define(function () {

	'use strict';
	
	return function Attribute$unbind () {
		// ignore non-dynamic attributes
		if ( this.fragment ) {
			this.fragment.unbind();
		}
	};

});