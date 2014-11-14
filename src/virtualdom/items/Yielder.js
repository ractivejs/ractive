import types from 'config/types';
import runloop from 'global/runloop';
import removeFromArray from 'utils/removeFromArray';
import Fragment from 'virtualdom/Fragment';

var Yielder = function ( options ) {
	var container, component;

	this.type = types.YIELDER;

	this.container = container = options.parentFragment.root;
	this.component = component = container.component;

	this.container = container;
	this.containerFragment = options.parentFragment;
	this.parentFragment = component.parentFragment;

	this.fragment = new Fragment({
		owner: this,
		root: container.parent,
		template: container._yield,
		pElement: this.containerFragment.pElement
	});

	component.yielders.push( this );

	runloop.scheduleTask( () => {
		if ( component.yielders.length > 1 ) {
			throw new Error( 'A component template can only have one {{yield}} declaration at a time' );
		}
	});
};

Yielder.prototype = {
	detach: function () {
		return this.fragment.detach();
	},

	find: function ( selector ) {
		return this.fragment.find( selector );
	},

	findAll: function ( selector, query ) {
		return this.fragment.findAll( selector, query );
	},

	findComponent: function ( selector ) {
		return this.fragment.findComponent( selector );
	},

	findAllComponents: function ( selector, query ) {
		return this.fragment.findAllComponents( selector, query );
	},

	findNextNode: function () {
		return this.containerFragment.findNextNode( this );
	},

	firstNode: function () {
		return this.fragment.firstNode();
	},

	getValue: function ( options ) {
		return this.fragment.getValue( options );
	},

	render: function () {
		return this.fragment.render();
	},

	unbind: function () {
		this.fragment.unbind();
	},

	unrender: function ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
		removeFromArray( this.component.yielders, this );
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	},

	toString: function () {
		return this.fragment.toString();
	}
};

export default Yielder;
