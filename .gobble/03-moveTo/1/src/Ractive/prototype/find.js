define(function () {

	'use strict';
	
	return function Ractive$find ( selector ) {
		if ( !this.el ) {
			return null;
		}
	
		return this.fragment.find( selector );
	};

});