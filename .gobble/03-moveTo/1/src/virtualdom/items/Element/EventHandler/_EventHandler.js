define(['virtualdom/items/Element/EventHandler/prototype/bubble','virtualdom/items/Element/EventHandler/prototype/fire','virtualdom/items/Element/EventHandler/prototype/getAction','virtualdom/items/Element/EventHandler/prototype/init','virtualdom/items/Element/EventHandler/prototype/listen','virtualdom/items/Element/EventHandler/prototype/rebind','virtualdom/items/Element/EventHandler/prototype/render','virtualdom/items/Element/EventHandler/prototype/resolve','virtualdom/items/Element/EventHandler/prototype/unbind','virtualdom/items/Element/EventHandler/prototype/unrender'],function (bubble, fire, getAction, init, listen, rebind, render, resolve, unbind, unrender) {

	'use strict';
	
	var EventHandler = function ( element, name, template ) {
		this.init( element, name, template );
	};
	
	EventHandler.prototype = {
		bubble: bubble,
		fire: fire,
		getAction: getAction,
		init: init,
		listen: listen,
		rebind: rebind,
		render: render,
		resolve: resolve,
		unbind: unbind,
		unrender: unrender
	};
	
	return EventHandler;

});