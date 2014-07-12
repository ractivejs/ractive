import types from 'config/types';
import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';

import detach from 'virtualdom/items/Triple/prototype/detach';
import find from 'virtualdom/items/Triple/prototype/find';
import findAll from 'virtualdom/items/Triple/prototype/findAll';
import firstNode from 'virtualdom/items/Triple/prototype/firstNode';
import render from 'virtualdom/items/Triple/prototype/render';
import setValue from 'virtualdom/items/Triple/prototype/setValue';
import toString from 'virtualdom/items/Triple/prototype/toString';
import unrender from 'virtualdom/items/Triple/prototype/unrender';
import update from 'virtualdom/items/Triple/prototype/update';

import unbind from 'virtualdom/items/shared/unbind';

var Triple = function ( options ) {
	this.type = types.TRIPLE;
	Mustache.init( this, options );
};

Triple.prototype = {
	detach: detach,
	find: find,
	findAll: findAll,
	firstNode: firstNode,
	getValue: Mustache.getValue,
	rebind: Mustache.rebind,
	render: render,
	resolve: Mustache.resolve,
	setValue: setValue,
	toString: toString,
	unbind: unbind,
	unrender: unrender,
	update: update
};

export default Triple;
