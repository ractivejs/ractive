define(['config/types','virtualdom/items/shared/Mustache/_Mustache','virtualdom/items/Section/prototype/bubble','virtualdom/items/Section/prototype/detach','virtualdom/items/Section/prototype/find','virtualdom/items/Section/prototype/findAll','virtualdom/items/Section/prototype/findAllComponents','virtualdom/items/Section/prototype/findComponent','virtualdom/items/Section/prototype/findNextNode','virtualdom/items/Section/prototype/firstNode','virtualdom/items/Section/prototype/merge','virtualdom/items/Section/prototype/render','virtualdom/items/Section/prototype/setValue','virtualdom/items/Section/prototype/splice','virtualdom/items/Section/prototype/toString','virtualdom/items/Section/prototype/unbind','virtualdom/items/Section/prototype/unrender','virtualdom/items/Section/prototype/update'],function (types, Mustache, bubble, detach, find, findAll, findAllComponents, findComponent, findNextNode, firstNode, merge, render, setValue, splice, toString, unbind, unrender, update) {

	'use strict';
	
	var Section = function ( options ) {
		this.type = types.SECTION;
		this.subtype = options.template.n;
		this.inverted = this.subtype === types.SECTION_UNLESS;
	
	
		this.pElement = options.pElement;
	
		this.fragments = [];
		this.fragmentsToCreate = [];
		this.fragmentsToRender = [];
		this.fragmentsToUnrender = [];
	
		this.length = 0; // number of times this section is rendered
	
		Mustache.init( this, options );
	};
	
	Section.prototype = {
		bubble: bubble,
		detach: detach,
		find: find,
		findAll: findAll,
		findAllComponents: findAllComponents,
		findComponent: findComponent,
		findNextNode: findNextNode,
		firstNode: firstNode,
		getValue: Mustache.getValue,
		merge: merge,
		rebind: Mustache.rebind,
		render: render,
		resolve: Mustache.resolve,
		setValue: setValue,
		splice: splice,
		toString: toString,
		unbind: unbind,
		unrender: unrender,
		update: update
	};
	
	return Section;

});