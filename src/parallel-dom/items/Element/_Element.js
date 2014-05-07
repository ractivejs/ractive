import runloop from 'global/runloop';
import css from 'global/css';

import initialise from 'parallel-dom/items/Element/initialise/_initialise';
import teardown from 'parallel-dom/items/Element/prototype/teardown';
import reassign from 'parallel-dom/items/Element/prototype/reassign';
import toString from 'parallel-dom/items/Element/prototype/toString';
import find from 'parallel-dom/items/Element/prototype/find';
import findAll from 'parallel-dom/items/Element/prototype/findAll';
import findComponent from 'parallel-dom/items/Element/prototype/findComponent';
import findAllComponents from 'parallel-dom/items/Element/prototype/findAllComponents';
import bind from 'parallel-dom/items/Element/prototype/bind';
import render from 'parallel-dom/items/Element/prototype/render';

var Element = function ( options, docFrag ) {
	initialise( this, options, docFrag );
};

Element.prototype = {
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
	bind: bind,
	render: render
};

export default Element;
