import runloop from 'global/runloop';
import removeFromArray from 'utils/removeFromArray';
import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

var Yielder = function ( options ) {
	var componentInstance, component;

	componentInstance = options.parentFragment.root;
	this.component = component = componentInstance.component;

	this.surrogateParent = options.parentFragment;
	this.parentFragment = component.parentFragment;

	this.fragment = new Fragment({
		owner: this,
		root: componentInstance._parent,
		template: componentInstance._yield,
		pElement: this.surrogateParent.pElement
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
		return this.surrogateParent.findNextNode( this );
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
