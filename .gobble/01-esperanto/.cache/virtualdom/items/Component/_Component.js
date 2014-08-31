define(['virtualdom/items/Component/prototype/detach','virtualdom/items/Component/prototype/find','virtualdom/items/Component/prototype/findAll','virtualdom/items/Component/prototype/findAllComponents','virtualdom/items/Component/prototype/findComponent','virtualdom/items/Component/prototype/findNextNode','virtualdom/items/Component/prototype/firstNode','virtualdom/items/Component/prototype/init','virtualdom/items/Component/prototype/rebind','virtualdom/items/Component/prototype/render','virtualdom/items/Component/prototype/toString','virtualdom/items/Component/prototype/unbind','virtualdom/items/Component/prototype/unrender'],function (detach, find, findAll, findAllComponents, findComponent, findNextNode, firstNode, init, rebind, render, toString, unbind, unrender) {

	'use strict';
	
	var Component = function ( options, Constructor ) {
		this.init( options, Constructor );
	};
	
	Component.prototype = {
		detach: detach,
		find: find,
		findAll: findAll,
		findAllComponents: findAllComponents,
		findComponent: findComponent,
		findNextNode: findNextNode,
		firstNode: firstNode,
		init: init,
		rebind: rebind,
		render: render,
		toString: toString,
		unbind: unbind,
		unrender: unrender
	};
	
	return Component;

});