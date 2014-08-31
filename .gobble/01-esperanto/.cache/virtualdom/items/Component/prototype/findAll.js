define(function () {

	'use strict';
	
	return function Component$findAll ( selector, query ) {
		return this.instance.fragment.findAll( selector, query );
	};

});