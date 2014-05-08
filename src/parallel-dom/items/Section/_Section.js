import types from 'config/types';
import Mustache from 'parallel-dom/shared/Mustache/_Mustache';

import createFragment from 'parallel-dom/items/Section/prototype/createFragment';
import detach from 'parallel-dom/items/Section/prototype/detach';
import find from 'parallel-dom/items/Section/prototype/find';
import findAll from 'parallel-dom/items/Section/prototype/findAll';
import findAllComponents from 'parallel-dom/items/Section/prototype/findAllComponents';
import findComponent from 'parallel-dom/items/Section/prototype/findComponent';
import findNextNode from 'parallel-dom/items/Section/prototype/findNextNode';
import firstNode from 'parallel-dom/items/Section/prototype/firstNode';
import merge from 'parallel-dom/items/Section/prototype/merge';
import render from 'parallel-dom/items/Section/prototype/render';
import setValue from 'parallel-dom/items/Section/prototype/setValue';
import splice from 'parallel-dom/items/Section/prototype/splice';
import teardown from 'parallel-dom/items/Section/prototype/teardown';
import teardownFragments from 'parallel-dom/items/Section/prototype/teardownFragments';
import toString from 'parallel-dom/items/Section/prototype/toString';

var Section = function ( options, docFrag ) {
	this.type = types.SECTION;
	this.inverted = !!options.template.n;

	this.pElement = options.pElement;

	this.fragments = [];
	this.length = 0; // number of times this section is rendered

	this.initialising = true;
	Mustache.init( this, options );
	this.initialising = false;
};

Section.prototype = {
	createFragment: createFragment,
	detach: detach,
	find: find,
	findAll: findAll,
	findAllComponents: findAllComponents,
	findComponent: findComponent,
	findNextNode: findNextNode,
	firstNode: firstNode,
	merge: merge,
	reassign: Mustache.reassign,
	render: render,
	resolve: Mustache.resolve,
	setValue: setValue,
	splice: splice,
	teardown: teardown,
	teardownFragments: teardownFragments,
	toString: toString,
	update: Mustache.update
};

export default Section;
