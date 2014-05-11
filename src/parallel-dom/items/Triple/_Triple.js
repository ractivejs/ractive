import types from 'config/types';
import Mustache from 'parallel-dom/shared/Mustache/_Mustache';

import detach from 'parallel-dom/items/Triple/prototype/detach';
import find from 'parallel-dom/items/Triple/prototype/find';
import findAll from 'parallel-dom/items/Triple/prototype/findAll';
import firstNode from 'parallel-dom/items/Triple/prototype/firstNode';
import render from 'parallel-dom/items/Triple/prototype/render';
import setValue from 'parallel-dom/items/Triple/prototype/setValue';
import teardown from 'parallel-dom/items/Triple/prototype/teardown';
import toString from 'parallel-dom/items/Triple/prototype/toString';
import unrender from 'parallel-dom/items/Triple/prototype/unrender';
import update from 'parallel-dom/items/Triple/prototype/update';

var Triple = function ( options ) {
	this.type = types.TRIPLE;
	Mustache.init( this, options );
};

Triple.prototype = {
	detach: detach,
	find: find,
	findAll: findAll,
	firstNode: firstNode,
	reassign: Mustache.reassign,
	render: render,
	resolve: Mustache.resolve,
	setValue: setValue,
	teardown: teardown,
	toString: toString,
	unrender: unrender,
	update: update
};

export default Triple;
