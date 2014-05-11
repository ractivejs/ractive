import fire from 'parallel-dom/items/Element/EventHandler/prototype/fire';
import init from 'parallel-dom/items/Element/EventHandler/prototype/init';
import rebind from 'parallel-dom/items/Element/EventHandler/prototype/rebind';
import render from 'parallel-dom/items/Element/EventHandler/prototype/render';
import teardown from 'parallel-dom/items/Element/EventHandler/prototype/teardown';
import unrender from 'parallel-dom/items/Element/EventHandler/prototype/unrender';

var EventHandler = function ( element, name, template ) {
	this.init( element, name, template );
};

EventHandler.prototype = {
	fire: fire,
	init: init,
	rebind: rebind,
	render: render,
	teardown: teardown,
	unrender: unrender
};

export default EventHandler;
