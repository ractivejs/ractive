import bubble from './prototype/bubble';
import fire from './prototype/fire';
import getAction from './prototype/getAction';
import init from './prototype/init';
import listen from './prototype/listen';
import rebind from './prototype/rebind';
import render from './prototype/render';
import resolve from './prototype/resolve';
import unbind from './prototype/unbind';
import unrender from './prototype/unrender';

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
	resolve: resolve,
	unbind: unbind,
	unrender: unrender
};

export default EventHandler;
