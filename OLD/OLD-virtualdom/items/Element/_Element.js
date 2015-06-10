import bubble from './prototype/bubble';
import detach from './prototype/detach';
import find from './prototype/find';
import findAll from './prototype/findAll';
import findAllComponents from './prototype/findAllComponents';
import findComponent from './prototype/findComponent';
import findNextNode from './prototype/findNextNode';
import firstNode from './prototype/firstNode';
import getAttribute from './prototype/getAttribute';
import init from './prototype/init';
import rebind from './prototype/rebind';
import render from './prototype/render';
import toString from './prototype/toString';
import unbind from './prototype/unbind';
import unrender from './prototype/unrender';

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
