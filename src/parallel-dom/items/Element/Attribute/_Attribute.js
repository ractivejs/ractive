import bubble from 'parallel-dom/items/Element/Attribute/prototype/bubble';
import init from 'parallel-dom/items/Element/Attribute/prototype/init';
import rebind from 'parallel-dom/items/Element/Attribute/prototype/rebind';
import render from 'parallel-dom/items/Element/Attribute/prototype/render';
import teardown from 'parallel-dom/items/Element/Attribute/prototype/teardown';
import toString from 'parallel-dom/items/Element/Attribute/prototype/toString';
import update from 'parallel-dom/items/Element/Attribute/prototype/update';
import updateBindings from 'parallel-dom/items/Element/Attribute/prototype/updateBindings';

var Attribute = function ( options ) {
	this.init( options );
};

Attribute.prototype = {
	bubble: bubble,
	init: init,
	rebind: rebind,
	render: render,
	teardown: teardown,
	toString: toString,
	update: update,
	updateBindings: updateBindings
};

export default Attribute;
