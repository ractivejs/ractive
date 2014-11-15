import createInstance from 'virtualdom/items/Component/initialise/createInstance';
import createParameters from 'shared/parameters/createParameters';
import propagateEvents from 'virtualdom/items/Component/initialise/propagateEvents';
import types from 'config/types';
import updateLiveQueries from 'virtualdom/items/Component/initialise/updateLiveQueries';
import warn from 'utils/warn';

export default function Component$init ( options, Component ) {
	var parentFragment, root, parameters;

	if ( !Component ) {
		throw new Error( 'Component "' + this.name + '" not found' );
	}

	parentFragment = this.parentFragment = options.parentFragment;
	root = parentFragment.root;

	this.root = root;
	this.type = types.COMPONENT;
	this.name = options.template.e;
	this.index = options.index;
	this.indexRefBindings = {};
	this.yielders = {};
	this.resolvers = [];

	parameters = createParameters( this, Component.prototype, options.template.a );
	createInstance( this, Component, parameters, options.template.f, options.template.p );
	propagateEvents( this, options.template.v );

	// intro, outro and decorator directives have no effect
	if ( options.template.t1 || options.template.t2 || options.template.o ) {
		warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
	}

	updateLiveQueries( this );
}
