import types from 'config/types';
import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';

import detach from 'virtualdom/items/Triple/prototype/detach';
import find from 'virtualdom/items/Triple/prototype/find';
import findAll from 'virtualdom/items/Triple/prototype/findAll';
import firstNode from 'virtualdom/items/Triple/prototype/firstNode';
import render from 'virtualdom/items/Triple/prototype/render';
import setValue from 'virtualdom/items/Triple/prototype/setValue';
import teardown from 'virtualdom/items/Triple/prototype/teardown';
import toString from 'virtualdom/items/Triple/prototype/toString';
import unrender from 'virtualdom/items/Triple/prototype/unrender';
import update from 'virtualdom/items/Triple/prototype/update';

var Triple = function ( options ) {
	this.type = types.TRIPLE;
	Mustache.init( this, options );
};

Triple.prototype = {
	detach: detach,
	find: find,
	findAll: findAll,
	firstNode: firstNode,
	rebind: Mustache.rebind,
	render: render,
	resolve: Mustache.resolve,
	setValue: setValue,
	teardown: teardown,
	toString: toString,
	unrender: unrender,
	update: update
};

export default Triple;
