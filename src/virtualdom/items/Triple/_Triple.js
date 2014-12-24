import { TRIPLE } from 'config/types';
import Mustache from 'virtualdom/items/shared/Mustache/_Mustache';

import detach from './prototype/detach';
import find from './prototype/find';
import findAll from './prototype/findAll';
import firstNode from './prototype/firstNode';
import render from './prototype/render';
import setValue from './prototype/setValue';
import toString from './prototype/toString';
import unrender from './prototype/unrender';
import update from './prototype/update';

import unbind from '../shared/unbind';

var Triple = function ( options ) {
	this.type = TRIPLE;
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
