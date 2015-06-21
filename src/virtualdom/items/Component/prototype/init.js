import createInstance from 'virtualdom/items/Component/initialise/createInstance';
import propagateEvents from 'virtualdom/items/Component/initialise/propagateEvents';
import { COMPONENT } from 'config/types';
import updateLiveQueries from 'virtualdom/items/Component/initialise/updateLiveQueries';
import { warnIfDebug } from 'utils/log';

export default function Component$init ( options, Component ) {
	var parentFragment, root;

	if ( !Component ) {
		throw new Error( 'Component "' + this.name + '" not found' );
	}

	parentFragment = this.parentFragment = options.parentFragment;
	root = parentFragment.root;

	this.root = root;
	this.type = COMPONENT;
	this.name = options.template.e;
	this.index = options.index;
	this.indexRefBindings = {};
	this.yielders = {};
	this.resolvers = [];

	createInstance( this, Component, options.template.a, options.template.f, options.template.p );
	propagateEvents( this, options.template.v );

	this.instance.getBoundEvents = () => Object.keys(options.template.v);

	// intro, outro and decorator directives have no effect
	if ( options.template.t0 || options.template.t1 || options.template.t2 || options.template.o ) {
		warnIfDebug( 'The "intro", "outro" and "decorator" directives have no effect on components', { ractive: this.instance });
	}

	updateLiveQueries( this );
}
