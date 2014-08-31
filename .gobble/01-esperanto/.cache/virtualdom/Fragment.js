define(['virtualdom/Fragment/prototype/bubble','virtualdom/Fragment/prototype/detach','virtualdom/Fragment/prototype/find','virtualdom/Fragment/prototype/findAll','virtualdom/Fragment/prototype/findAllComponents','virtualdom/Fragment/prototype/findComponent','virtualdom/Fragment/prototype/findNextNode','virtualdom/Fragment/prototype/firstNode','virtualdom/Fragment/prototype/getNode','virtualdom/Fragment/prototype/getValue','virtualdom/Fragment/prototype/init','virtualdom/Fragment/prototype/rebind','virtualdom/Fragment/prototype/render','virtualdom/Fragment/prototype/toString','virtualdom/Fragment/prototype/unbind','virtualdom/Fragment/prototype/unrender','circular'],function (bubble, detach, find, findAll, findAllComponents, findComponent, findNextNode, firstNode, getNode, getValue, init, rebind, render, toString, unbind, unrender, circular) {

	'use strict';
	
	var Fragment = function ( options ) {
		this.init( options );
	};
	
	Fragment.prototype = {
		bubble: bubble,
		detach: detach,
		find: find,
		findAll: findAll,
		findAllComponents: findAllComponents,
		findComponent: findComponent,
		findNextNode: findNextNode,
		firstNode: firstNode,
		getNode: getNode,
		getValue: getValue,
		init: init,
		rebind: rebind,
		render: render,
		toString: toString,
		unbind: unbind,
		unrender: unrender
	};
	
	circular.Fragment = Fragment;
	
	return Fragment;

});