import types from 'config/types';
import warn from 'utils/warn';
import createMappings from 'virtualdom/items/Component/initialise/createMappings';
import createInstance from 'virtualdom/items/Component/initialise/createInstance';
import propagateEvents from 'virtualdom/items/Component/initialise/propagateEvents';
import updateLiveQueries from 'virtualdom/items/Component/initialise/updateLiveQueries';

export default function Component$init ( options, Component ) {
	var parentFragment,
		mappings,
		root,
		data,
		toBind;

	parentFragment = this.parentFragment = options.parentFragment;
	root = parentFragment.root;

	this.root = root;
	this.type = types.COMPONENT;
	this.name = options.template.e;
	this.index = options.index;
	this.indexRefBindings = {};
	this.bindings = [];

	// even though only one yielder is allowed, we need to have an array of them
	// as it's possible to cause a yielder to be created before the last one
	// was destroyed in the same turn of the runloop
	this.yielders = [];

	if ( !Component ) {
		throw new Error( 'Component "' + this.name + '" not found' );
	}

	mappings = createMappings( root, options.template.a );

	createInstance( this, Component, {}, mappings, options.template.f );
	propagateEvents( this, options.template.v );

	// intro, outro and decorator directives have no effect
	if ( options.template.t1 || options.template.t2 || options.template.o ) {
		warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
	}

	updateLiveQueries( this );
}
