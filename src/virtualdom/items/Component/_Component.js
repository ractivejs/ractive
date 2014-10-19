import createMapping from 'virtualdom/items/Component/prototype/createMapping';
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
import toString from 'virtualdom/items/Component/prototype/toString';
import unbind from 'virtualdom/items/Component/prototype/unbind';
import unrender from 'virtualdom/items/Component/prototype/unrender';

var Component = function ( options, Constructor ) {
	this.init( options, Constructor );
};

Component.prototype = {
	createMapping: createMapping,
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
	toString: toString,
	unbind: unbind,
	unrender: unrender
};

export default Component;
