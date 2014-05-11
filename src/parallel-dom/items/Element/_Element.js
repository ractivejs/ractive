import bubble from 'parallel-dom/items/Element/prototype/bubble';
import detach from 'parallel-dom/items/Element/prototype/detach';
import find from 'parallel-dom/items/Element/prototype/find';
import findAll from 'parallel-dom/items/Element/prototype/findAll';
import findAllComponents from 'parallel-dom/items/Element/prototype/findAllComponents';
import findComponent from 'parallel-dom/items/Element/prototype/findComponent';
import findNextNode from 'parallel-dom/items/Element/prototype/findNextNode';
import firstNode from 'parallel-dom/items/Element/prototype/firstNode';
import getAttribute from 'parallel-dom/items/Element/prototype/getAttribute';
import init from 'parallel-dom/items/Element/prototype/init';
import reassign from 'parallel-dom/items/Element/prototype/reassign';
import render from 'parallel-dom/items/Element/prototype/render';
import teardown from 'parallel-dom/items/Element/prototype/teardown';
import toString from 'parallel-dom/items/Element/prototype/toString';
import unrender from 'parallel-dom/items/Element/prototype/unrender';

var Element = function ( options ) {
	this.init( options );
};

Element.prototype = {
	bubble: bubble,
	detach: detach,
	find: find,
	findAll: findAll,
	findAllComponents: findAllComponents,
	findComponent: findComponent,
	findNextNode: findNextNode,
	firstNode: firstNode,
	getAttribute: getAttribute,
	init: init,
	reassign: reassign,
	render: render,
	teardown: teardown,
	toString: toString,
	unrender: unrender
};

export default Element;
