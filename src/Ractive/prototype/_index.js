define([
	'Ractive/prototype/get/_index',
	'Ractive/prototype/set',
	'Ractive/prototype/update',
	'Ractive/prototype/updateModel',
	'Ractive/prototype/animate/_index',
	'Ractive/prototype/on',
	'Ractive/prototype/off',
	'Ractive/prototype/observe',
	'Ractive/prototype/fire',
	'Ractive/prototype/find',
	'Ractive/prototype/findAll',
	'Ractive/prototype/renderHTML',
	'Ractive/prototype/teardown'
], function (
	get,
	set,
	update,
	updateModel,
	animate,
	on,
	off,
	observe,
	fire,
	find,
	findAll,
	renderHTML,
	teardown
) {
	
	'use strict';

	return {
		get: get,
		set: set,
		update: update,
		updateModel: updateModel,
		on: on,
		off: off,
		observe: observe,
		fire: fire,
		find: find,
		findAll: findAll,
		renderHTML: renderHTML,
		teardown: teardown
	};

});