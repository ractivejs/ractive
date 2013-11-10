define([
	'Ractive/prototype/get/_get',
	'Ractive/prototype/set',
	'Ractive/prototype/update',
	'Ractive/prototype/updateModel',
	'Ractive/prototype/animate/_animate',
	'Ractive/prototype/on',
	'Ractive/prototype/off',
	'Ractive/prototype/observe',
	'Ractive/prototype/fire',
	'Ractive/prototype/find',
	'Ractive/prototype/findAll',
	'Ractive/prototype/renderHTML',
	'Ractive/prototype/teardown',
	'Ractive/prototype/add',
	'Ractive/prototype/subtract',
	'Ractive/prototype/toggle'
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
	teardown,
	add,
	subtract,
	toggle
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
		teardown: teardown,
		add: add,
		subtract: subtract,
		toggle: toggle
	};

});