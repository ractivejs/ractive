import bubble from 'virtualdom/items/Element/prototype/bubble';
import detach from 'virtualdom/items/Element/prototype/detach';
import find from 'virtualdom/items/Element/prototype/find';
import findAll from 'virtualdom/items/Element/prototype/findAll';
import findAllComponents from 'virtualdom/items/Element/prototype/findAllComponents';
import findComponent from 'virtualdom/items/Element/prototype/findComponent';
import findNextNode from 'virtualdom/items/Element/prototype/findNextNode';
import firstNode from 'virtualdom/items/Element/prototype/firstNode';
import getAttribute from 'virtualdom/items/Element/prototype/getAttribute';
import init from 'virtualdom/items/Element/prototype/init';
import rebind from 'virtualdom/items/Element/prototype/rebind';
import render from 'virtualdom/items/Element/prototype/render';
import toString from 'virtualdom/items/Element/prototype/toString';
import unbind from 'virtualdom/items/Element/prototype/unbind';
import unrender from 'virtualdom/items/Element/prototype/unrender';

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
	rebind: rebind,
	render: render,
	toString: toString,
	unbind: unbind,
	unrender: unrender
};

export default Element;
