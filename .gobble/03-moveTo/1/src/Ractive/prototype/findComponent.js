define(function () {

	'use strict';
	
	return function Ractive$findComponent ( selector ) {
		return this.fragment.findComponent( selector );
	};

});