import types from 'config/types';
import warn from 'utils/warn';
import createModel from 'parallel-dom/items/Component/initialise/createModel/_createModel';
import createInstance from 'parallel-dom/items/Component/initialise/createInstance';
import createBindings from 'parallel-dom/items/Component/initialise/createBindings';
import propagateEvents from 'parallel-dom/items/Component/initialise/propagateEvents';
import updateLiveQueries from 'parallel-dom/items/Component/initialise/updateLiveQueries';

export default function initialiseComponent ( component, options, docFrag ) {
	var parentFragment,
		root,
		Component,
		data,
		toBind;

	parentFragment = component.parentFragment = options.parentFragment;
	root = parentFragment.root;

	component.root = root;
	component.type = types.COMPONENT;
	component.name = options.template.e;
	component.index = options.index;
	component.indexRefBindings = {};
	component.bindings = [];

	// get the component constructor
	Component = root.components[ options.template.e ];

	if ( !Component ) {
		throw new Error( 'Component "' + options.template.e + '" not found' );
	}

	// First, we need to create a model for the component - e.g. if we
	// encounter <widget foo='bar'/> then we need to create a widget
	// with `data: { foo: 'bar' }`.
	//
	// This may involve setting up some bindings, but we can't do it
	// yet so we take some notes instead
	toBind = [];
	data = createModel( component, Component.data || {}, options.template.a, toBind );

	createInstance( component, Component, data, docFrag, options.template.f );
	createBindings( component, toBind );
	propagateEvents( component, options.template.v );

	// intro, outro and decorator directives have no effect
	if ( options.template.t1 || options.template.t2 || options.template.o ) {
		warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
	}

	updateLiveQueries( component );
}
