define([
	'render/shared/Mustache/initialise',
	'render/shared/Mustache/update',
	'render/shared/Mustache/resolve',
	'render/shared/Mustache/reassign'
], function (
	init,
	update,
	resolve,
	reassign
) {

	'use strict';

	return {
		init: init,
		update: update,
		resolve: resolve,
		reassign: reassign
	};

});
