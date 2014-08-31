define(function () {

	'use strict';
	
	return function Component$detach () {
		return this.instance.fragment.detach();
	};

});