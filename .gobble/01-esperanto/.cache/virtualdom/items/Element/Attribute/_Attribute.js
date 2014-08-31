define(['virtualdom/items/Element/Attribute/prototype/bubble','virtualdom/items/Element/Attribute/prototype/init','virtualdom/items/Element/Attribute/prototype/rebind','virtualdom/items/Element/Attribute/prototype/render','virtualdom/items/Element/Attribute/prototype/toString','virtualdom/items/Element/Attribute/prototype/unbind','virtualdom/items/Element/Attribute/prototype/update'],function (bubble, init, rebind, render, toString, unbind, update) {

	'use strict';
	
	var Attribute = function ( options ) {
		this.init( options );
	};
	
	Attribute.prototype = {
		bubble: bubble,
		init: init,
		rebind: rebind,
		render: render,
		toString: toString,
		unbind: unbind,
		update: update
	};
	
	return Attribute;

});