import types from 'config/types';
import Mustache from 'parallel-dom/items/shared/Mustache/_Mustache';

import bubble from 'parallel-dom/items/Section/prototype/bubble';
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
import toString from 'parallel-dom/items/Section/prototype/toString';
import unrender from 'parallel-dom/items/Section/prototype/unrender';
import update from 'parallel-dom/items/Section/prototype/update';

var Section = function ( options ) {
	this.type = types.SECTION;
	this.inverted = !!options.template.n;

	this.pElement = options.pElement;

	this.fragments = [];
	this.unrenderedFragments = [];

	this.length = 0; // number of times this section is rendered

	Mustache.init( this, options );
};

Section.prototype = {
	bubble: bubble,
	detach: detach,
	find: find,
	findAll: findAll,
	findAllComponents: findAllComponents,
	findComponent: findComponent,
	findNextNode: findNextNode,
	firstNode: firstNode,
	merge: merge,
	rebind: Mustache.rebind,
	render: render,
	resolve: Mustache.resolve,
	setValue: setValue,
	splice: splice,
	teardown: teardown,
	toString: toString,
	unrender: unrender,
	update: update
};

export default Section;
