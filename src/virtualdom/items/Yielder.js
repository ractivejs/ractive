import { YIELDER } from 'config/types';
import runloop from 'global/runloop';
import { removeFromArray } from 'utils/array';
import Fragment from 'virtualdom/Fragment';
import { isArray } from 'utils/is';

var Yielder = function ( options ) {
	var container, component;

	this.type = YIELDER;

	this.container = container = options.parentFragment.root;
	this.component = component = container.component;

	this.container = container;
	this.containerFragment = options.parentFragment;
	this.parentFragment = component.parentFragment;

	let name = this.name = options.template.yn || '';

	this.fragment = new Fragment({
		owner: this,
		root: container.parent,
		template: container._inlinePartials[ name ] || [],
		pElement: this.containerFragment.pElement
	});

	// even though only one yielder is allowed, we need to have an array of them
	// as it's possible to cause a yielder to be created before the last one
	// was destroyed in the same turn of the runloop
	if ( !isArray( component.yielders[ name ] ) ) {
		component.yielders[ name ] = [ this ];
	} else {
		component.yielders[ name ].push( this );
	}

	runloop.scheduleTask( () => {
		if ( component.yielders[ name ].length > 1 ) {
			throw new Error( 'A component template can only have one {{yield' + (name ? ' ' + name : '') + '}} declaration at a time' );
		}
	});
};

Yielder.prototype = {
	detach () {
		return this.fragment.detach();
	},

	find ( selector ) {
		return this.fragment.find( selector );
	},

	findAll ( selector, query ) {
		return this.fragment.findAll( selector, query );
	},

	findComponent ( selector ) {
		return this.fragment.findComponent( selector );
	},

	findAllComponents ( selector, query ) {
		return this.fragment.findAllComponents( selector, query );
	},

	findNextNode () {
		return this.containerFragment.findNextNode( this );
	},

	firstNode () {
		return this.fragment.firstNode();
	},

	getValue ( options ) {
		return this.fragment.getValue( options );
	},

	render () {
		return this.fragment.render();
	},

	unbind () {
		this.fragment.unbind();
	},

	unrender ( shouldDestroy ) {
		this.fragment.unrender( shouldDestroy );
		removeFromArray( this.component.yielders[ this.name ], this );
	},

	rebind ( oldKeypath, newKeypath ) {
		this.fragment.rebind( oldKeypath, newKeypath );
	},

	toString () {
		return this.fragment.toString();
	}
};

export default Yielder;
