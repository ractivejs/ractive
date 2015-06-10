import bubble from './prototype/bubble';
import init from './prototype/init';
import rebind from './prototype/rebind';
import render from './prototype/render';
import toString from './prototype/toString';
import unbind from './prototype/unbind';
import update from './prototype/update';

var Attribute = function ( options ) {
	this.init( options );
};

Attribute.prototype = {
	bubble: bubble,
	init: init,
	rebind: rebind,
	render: render,
	toString: toString,
	unbind: unbind,
	update: update
};

export default Attribute;
