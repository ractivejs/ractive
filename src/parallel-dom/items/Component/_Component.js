import detach from 'parallel-dom/items/Component/prototype/detach';
import find from 'parallel-dom/items/Component/prototype/find';
import findAll from 'parallel-dom/items/Component/prototype/findAll';
import findAllComponents from 'parallel-dom/items/Component/prototype/findAllComponents';
import findComponent from 'parallel-dom/items/Component/prototype/findComponent';
import findNextNode from 'parallel-dom/items/Component/prototype/findNextNode';
import firstNode from 'parallel-dom/items/Component/prototype/firstNode';
import init from 'parallel-dom/items/Component/prototype/init';
import reassign from 'parallel-dom/items/Component/prototype/reassign';
import render from 'parallel-dom/items/Component/prototype/render';
import teardown from 'parallel-dom/items/Component/prototype/teardown';
import toString from 'parallel-dom/items/Component/prototype/toString';
import unrender from 'parallel-dom/items/Component/prototype/unrender';

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
	reassign: reassign,
	render: render,
	teardown: teardown,
	toString: toString,
	unrender: unrender
};

export default Component;
