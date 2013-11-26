define([
	'render/DomFragment/Element/initialise/_initialise',

	'render/DomFragment/Element/prototype/teardown',
	'render/DomFragment/Element/prototype/toString',
	'render/DomFragment/Element/prototype/find',
	'render/DomFragment/Element/prototype/findAll'
], function (
	initialise,

	teardown,
	toString,
	find,
	findAll
) {
	
	'use strict';

	var DomElement = function ( options, docFrag ) {
		initialise( this, options, docFrag );
	};

	DomElement.prototype = {
		detach: function () {
			this.node.parentNode.removeChild( this.node );
			return this.node;
		},

		teardown: teardown,

		firstNode: function () {
			return this.node;
		},

		findNextNode: function () {
			return null;
		},

		// TODO can we get rid of this?
		bubble: function () {}, // just so event proxy and transition fragments have something to call!

		toString: toString,
		find: find,
		findAll: findAll
	};

	return DomElement;

});