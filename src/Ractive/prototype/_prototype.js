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
	'Ractive/prototype/render',
	'Ractive/prototype/renderHTML',
	'Ractive/prototype/teardown',
	'Ractive/prototype/add',
	'Ractive/prototype/subtract',
	'Ractive/prototype/toggle',
	'Ractive/prototype/merge/_merge'
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
	render,
	renderHTML,
	teardown,
	add,
	subtract,
	toggle,
	merge
) {
	
	'use strict';

	return {
		get: get,
		set: set,
		update: update,
		updateModel: updateModel,
		animate: animate,
		on: on,
		off: off,
		observe: observe,
		fire: fire,
		find: find,
		findAll: findAll,
		renderHTML: renderHTML,
		render: render,
		teardown: teardown,
		add: add,
		subtract: subtract,
		toggle: toggle,
		merge: merge
	};

});