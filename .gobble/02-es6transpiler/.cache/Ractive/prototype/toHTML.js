define(function () {

	'use strict';
	
	return function Ractive$toHTML () {
		return this.fragment.toString( true );
	};

});