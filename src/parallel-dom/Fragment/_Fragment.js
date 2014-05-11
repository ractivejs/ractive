import bubble from 'parallel-dom/Fragment/prototype/bubble';
import createItem from 'parallel-dom/Fragment/prototype/createItem';
import detach from 'parallel-dom/Fragment/prototype/detach';
import find from 'parallel-dom/Fragment/prototype/find';
import findAll from 'parallel-dom/Fragment/prototype/findAll';
import findAllComponents from 'parallel-dom/Fragment/prototype/findAllComponents';
import findComponent from 'parallel-dom/Fragment/prototype/findComponent';
import findNextNode from 'parallel-dom/Fragment/prototype/findNextNode';
import firstNode from 'parallel-dom/Fragment/prototype/firstNode';
import getNode from 'parallel-dom/Fragment/prototype/getNode';
import getValue from 'parallel-dom/Fragment/prototype/getValue';
import init from 'parallel-dom/Fragment/prototype/init';
import isSimple from 'parallel-dom/Fragment/prototype/isSimple';
import reassign from 'parallel-dom/Fragment/prototype/reassign';
import render from 'parallel-dom/Fragment/prototype/render';
import teardown from 'parallel-dom/Fragment/prototype/teardown';
import toString from 'parallel-dom/Fragment/prototype/toString';
import unrender from 'parallel-dom/Fragment/prototype/unrender';

import circular from 'circular';

var Fragment = function ( options ) {
	this.init( options );
};

Fragment.prototype = {
	bubble: bubble,
	createItem: createItem,
	detach: detach,
	find: find,
	findAll: findAll,
	findAllComponents: findAllComponents,
	findComponent: findComponent,
	findNextNode: findNextNode,
	firstNode: firstNode,
	getNode: getNode,
	getValue: getValue,
	init: init,
	isSimple: isSimple,
	reassign: reassign,
	render: render,
	teardown: teardown,
	toString: toString,
	unrender: unrender
};

circular.Fragment = Fragment;

export default Fragment;
