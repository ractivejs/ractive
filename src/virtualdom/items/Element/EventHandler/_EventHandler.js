import bubble from 'virtualdom/items/Element/EventHandler/prototype/bubble';
import fire from 'virtualdom/items/Element/EventHandler/prototype/fire';
import getAction from 'virtualdom/items/Element/EventHandler/prototype/getAction';
import init from 'virtualdom/items/Element/EventHandler/prototype/init';
import listen from 'virtualdom/items/Element/EventHandler/prototype/listen';
import rebind from 'virtualdom/items/Element/EventHandler/prototype/rebind';
import render from 'virtualdom/items/Element/EventHandler/prototype/render';
import teardown from 'virtualdom/items/Element/EventHandler/prototype/teardown';
import unrender from 'virtualdom/items/Element/EventHandler/prototype/unrender';



var EventHandler = function ( element, name, template ) {
	this.init( element, name, template );
};

EventHandler.prototype = {
	bubble: bubble,
	fire: fire,
	getAction: getAction,
	init: init,
	listen: listen,
	rebind: rebind,
	render: render,
	teardown: teardown,
	unrender: unrender
};

export default EventHandler;
