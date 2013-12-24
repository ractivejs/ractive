define([
	'render/DomFragment/Element/initialise/_initialise',

	'render/DomFragment/Element/prototype/teardown',
	'render/DomFragment/Element/prototype/toString',
	'render/DomFragment/Element/prototype/find',
	'render/DomFragment/Element/prototype/findAll',
	'render/DomFragment/Element/prototype/findComponent',
	'render/DomFragment/Element/prototype/findAllComponents',
	'render/DomFragment/Element/prototype/bind'
], function (
	initialise,

	teardown,
	toString,
	find,
	findAll,
	findComponent,
	findAllComponents,
	bind
) {

	'use strict';

	var DomElement = function ( options, docFrag ) {
		initialise( this, options, docFrag );
	};

	DomElement.prototype = {
		detach: function () {
			if ( this.node ) {
				// need to check for parent node - DOM may have been altered
				// by something other than Ractive! e.g. jQuery UI...
				if ( this.node.parentNode ) {
					this.node.parentNode.removeChild( this.node );
				}
				return this.node;
			}
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
		findAll: findAll,
		findComponent: findComponent,
		findAllComponents: findAllComponents,
		bind: bind
	};

	return DomElement;

});