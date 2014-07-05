import bubble from 'virtualdom/Fragment/prototype/bubble';
import detach from 'virtualdom/Fragment/prototype/detach';
import find from 'virtualdom/Fragment/prototype/find';
import findAll from 'virtualdom/Fragment/prototype/findAll';
import findAllComponents from 'virtualdom/Fragment/prototype/findAllComponents';
import findComponent from 'virtualdom/Fragment/prototype/findComponent';
import findNextNode from 'virtualdom/Fragment/prototype/findNextNode';
import firstNode from 'virtualdom/Fragment/prototype/firstNode';
import getNode from 'virtualdom/Fragment/prototype/getNode';
import getValue from 'virtualdom/Fragment/prototype/getValue';
import init from 'virtualdom/Fragment/prototype/init';
import rebind from 'virtualdom/Fragment/prototype/rebind';
import render from 'virtualdom/Fragment/prototype/render';
import toString from 'virtualdom/Fragment/prototype/toString';
import unbind from 'virtualdom/Fragment/prototype/unbind';
import unrender from 'virtualdom/Fragment/prototype/unrender';

import circular from 'circular';

var Fragment = function ( options ) {
	this.init( options );
};

Fragment.prototype = {
	bubble: bubble,
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
	rebind: rebind,
	render: render,
	toString: toString,
	unbind: unbind,
	unrender: unrender
};

circular.Fragment = Fragment;

export default Fragment;
