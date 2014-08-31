define(function () {

	'use strict';
	
	return function Component$find ( selector ) {
		return this.instance.fragment.find( selector );
	};

});