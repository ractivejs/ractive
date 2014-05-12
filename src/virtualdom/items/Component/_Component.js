import detach from 'virtualdom/items/Component/prototype/detach';
import find from 'virtualdom/items/Component/prototype/find';
import findAll from 'virtualdom/items/Component/prototype/findAll';
import findAllComponents from 'virtualdom/items/Component/prototype/findAllComponents';
import findComponent from 'virtualdom/items/Component/prototype/findComponent';
import findNextNode from 'virtualdom/items/Component/prototype/findNextNode';
import firstNode from 'virtualdom/items/Component/prototype/firstNode';
import init from 'virtualdom/items/Component/prototype/init';
import rebind from 'virtualdom/items/Component/prototype/rebind';
import render from 'virtualdom/items/Component/prototype/render';
import teardown from 'virtualdom/items/Component/prototype/teardown';
import toString from 'virtualdom/items/Component/prototype/toString';
import unrender from 'virtualdom/items/Component/prototype/unrender';

var Component = function ( options ) {
	this.init( options );
};

Component.prototype = {
	detach: detach,
	find: find,
	findAll: findAll,
	findAllComponents: findAllComponents,
	findComponent: findComponent,
	findNextNode: findNextNode,
	firstNode: firstNode,
	init: init,
	rebind: rebind,
	render: render,
	teardown: teardown,
	toString: toString,
	unrender: unrender
};

export default Component;
