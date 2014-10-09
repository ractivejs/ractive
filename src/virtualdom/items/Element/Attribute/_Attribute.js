import bubble from 'virtualdom/items/Element/Attribute/prototype/bubble';
import init from 'virtualdom/items/Element/Attribute/prototype/init';
import rebind from 'virtualdom/items/Element/Attribute/prototype/rebind';
import render from 'virtualdom/items/Element/Attribute/prototype/render';
import toString from 'virtualdom/items/Element/Attribute/prototype/toString';
import unbind from 'virtualdom/items/Element/Attribute/prototype/unbind';
import update from 'virtualdom/items/Element/Attribute/prototype/update';

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
