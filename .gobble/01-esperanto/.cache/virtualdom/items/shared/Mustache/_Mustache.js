define(['virtualdom/items/shared/Mustache/getValue','virtualdom/items/shared/Mustache/initialise','virtualdom/items/shared/Mustache/resolve','virtualdom/items/shared/Mustache/rebind'],function (getValue, init, resolve, rebind) {

	'use strict';
	
	return {
		getValue: getValue,
		init: init,
		resolve: resolve,
		rebind: rebind
	};

});