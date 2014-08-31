define(['config/types','virtualdom/items/shared/Mustache/_Mustache','virtualdom/items/Triple/prototype/detach','virtualdom/items/Triple/prototype/find','virtualdom/items/Triple/prototype/findAll','virtualdom/items/Triple/prototype/firstNode','virtualdom/items/Triple/prototype/render','virtualdom/items/Triple/prototype/setValue','virtualdom/items/Triple/prototype/toString','virtualdom/items/Triple/prototype/unrender','virtualdom/items/Triple/prototype/update','virtualdom/items/shared/unbind'],function (types, Mustache, detach, find, findAll, firstNode, render, setValue, toString, unrender, update, unbind) {

	'use strict';
	
	var Triple = function ( options ) {
		this.type = types.TRIPLE;
		Mustache.init( this, options );
	};
	
	Triple.prototype = {
		detach: detach,
		find: find,
		findAll: findAll,
		firstNode: firstNode,
		getValue: Mustache.getValue,
		rebind: Mustache.rebind,
		render: render,
		resolve: Mustache.resolve,
		setValue: setValue,
		toString: toString,
		unbind: unbind,
		unrender: unrender,
		update: update
	};
	
	return Triple;

});