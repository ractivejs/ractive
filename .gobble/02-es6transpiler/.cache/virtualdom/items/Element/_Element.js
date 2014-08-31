define(['virtualdom/items/Element/prototype/bubble','virtualdom/items/Element/prototype/detach','virtualdom/items/Element/prototype/find','virtualdom/items/Element/prototype/findAll','virtualdom/items/Element/prototype/findAllComponents','virtualdom/items/Element/prototype/findComponent','virtualdom/items/Element/prototype/findNextNode','virtualdom/items/Element/prototype/firstNode','virtualdom/items/Element/prototype/getAttribute','virtualdom/items/Element/prototype/init','virtualdom/items/Element/prototype/rebind','virtualdom/items/Element/prototype/render','virtualdom/items/Element/prototype/toString','virtualdom/items/Element/prototype/unbind','virtualdom/items/Element/prototype/unrender'],function (bubble, detach, find, findAll, findAllComponents, findComponent, findNextNode, firstNode, getAttribute, init, rebind, render, toString, unbind, unrender) {

	'use strict';
	
	var Element = function ( options ) {
		this.init( options );
	};
	
	Element.prototype = {
		bubble: bubble,
		detach: detach,
		find: find,
		findAll: findAll,
		findAllComponents: findAllComponents,
		findComponent: findComponent,
		findNextNode: findNextNode,
		firstNode: firstNode,
		getAttribute: getAttribute,
		init: init,
		rebind: rebind,
		render: render,
		toString: toString,
		unbind: unbind,
		unrender: unrender
	};
	
	return Element;

});