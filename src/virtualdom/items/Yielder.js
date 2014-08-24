import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

var Yielder = function ( options ) {
	var componentInstance, component, ractive;

	componentInstance = options.parentFragment.root;
	component = componentInstance.component;

	this.surrogateParent = options.parentFragment;
	this.parentFragment = component.parentFragment;

	if ( component.yielder ) {
		// TODO catch this at parse time
		throw new Error( 'A component template can only have one {{yield}} declaration' );
	}

	this.fragment = new Fragment({
		owner: this,
		root: componentInstance.yield.instance,
		template: componentInstance.yield.template
	});

	component.yielder = this;
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

	unrender: function () {
		this.fragment.unrender();
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		this.fragment.rebind( indexRef, newIndex, oldKeypath, newKeypath );
	},

	toString: function () {
		return this.fragment.toString();
	}
};

export default Yielder;
