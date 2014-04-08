define([
	'global/runloop',
	'global/css',
	'render/DomFragment/Element/initialise/_initialise',
	'render/DomFragment/Element/prototype/teardown',
	'render/DomFragment/Element/prototype/reassign',
	'render/DomFragment/Element/prototype/toString',
	'render/DomFragment/Element/prototype/find',
	'render/DomFragment/Element/prototype/findAll',
	'render/DomFragment/Element/prototype/findComponent',
	'render/DomFragment/Element/prototype/findAllComponents',
	'render/DomFragment/Element/prototype/bind'
], function (
	runloop,
	css,
	initialise,
	teardown,
	reassign,
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
			var Component;

			if ( this.node ) {
				// need to check for parent node - DOM may have been altered
				// by something other than Ractive! e.g. jQuery UI...
				if ( this.node.parentNode ) {
					this.node.parentNode.removeChild( this.node );
				}
				return this.node;
			}

			// If this element has child components with their own CSS, that CSS needs to
			// be removed now
			// TODO optimise this
			if ( this.cssDetachQueue.length ) {
				runloop.start();
				while ( Component === this.cssDetachQueue.pop() ) {
					css.remove( Component );
				}
				runloop.end();
			}
		},

		teardown: teardown,

		reassign: reassign,

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
