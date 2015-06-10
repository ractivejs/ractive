import bubble from './Fragment/prototype/bubble';
import detach from './Fragment/prototype/detach';
import find from './Fragment/prototype/find';
import findAll from './Fragment/prototype/findAll';
import findAllComponents from './Fragment/prototype/findAllComponents';
import findComponent from './Fragment/prototype/findComponent';
import findNextNode from './Fragment/prototype/findNextNode';
import firstNode from './Fragment/prototype/firstNode';
import getArgsList from './Fragment/prototype/getArgsList';
import getNode from './Fragment/prototype/getNode';
import getValue from './Fragment/prototype/getValue';
import init from './Fragment/prototype/init';
import rebind from './Fragment/prototype/rebind';
import render from './Fragment/prototype/render';
import toString from './Fragment/prototype/toString';
import unbind from './Fragment/prototype/unbind';
import unrender from './Fragment/prototype/unrender';

var Fragment = function ( options ) {
	this.init( options );
};

Fragment.prototype = {
	bubble: bubble,
	detach: detach,
	find: find,
	findAll: findAll,
	findAllComponents: findAllComponents,
	findComponent: findComponent,
	findNextNode: findNextNode,
	firstNode: firstNode,
	getArgsList: getArgsList,
	getNode: getNode,
	getValue: getValue,
	init: init,
	rebind: rebind,
	registerIndexRef: function( idx ) {
		var idxs = this.registeredIndexRefs;
		if ( idxs.indexOf( idx ) === -1 ) {
			idxs.push( idx );
		}
	},
	render: render,
	toString: toString,
	unbind: unbind,
	unregisterIndexRef: function( idx ) {
		var idxs = this.registeredIndexRefs;
		idxs.splice( idxs.indexOf( idx ), 1 );
	},
	unrender: unrender
};

export default Fragment;
