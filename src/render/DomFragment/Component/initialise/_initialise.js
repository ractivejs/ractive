define([
	'config/types',
	'utils/warn',
	'render/DomFragment/Component/initialise/createModel/_createModel',
	'render/DomFragment/Component/initialise/createInstance',
	'render/DomFragment/Component/initialise/createBindings',
	'render/DomFragment/Component/initialise/propagateEvents',
	'render/DomFragment/Component/initialise/updateLiveQueries'
], function (
	types,
	warn,
	createModel,
	createInstance,
	createBindings,
	propagateEvents,
	updateLiveQueries
) {

	'use strict';

	return function initialiseComponent ( component, options, docFrag ) {
		var parentFragment,
			root,
			Component,
			data,
			toBind;

		parentFragment = component.parentFragment = options.parentFragment;
		root = parentFragment.root;

		component.root = root;
		component.type = types.COMPONENT;
		component.name = options.descriptor.e;
		component.index = options.index;
		component.indexRefBindings = {};
		component.bindings = [];

		// get the component constructor
		Component = root.components[ options.descriptor.e ];

		if ( !Component ) {
			throw new Error( 'Component "' + options.descriptor.e + '" not found' );
		}

		// First, we need to create a model for the component - e.g. if we
		// encounter <widget foo='bar'/> then we need to create a widget
		// with `data: { foo: 'bar' }`.
		//
		// This may involve setting up some bindings, but we can't do it
		// yet so we take some notes instead
		toBind = [];
		data = createModel( component, Component.data || {}, options.descriptor.a, toBind );

		createInstance( component, Component, data, docFrag, options.descriptor.f );
		createBindings( component, toBind );
		propagateEvents( component, options.descriptor.v );

		// intro, outro and decorator directives have no effect
		if ( options.descriptor.t1 || options.descriptor.t2 || options.descriptor.o ) {
			warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
		}

		updateLiveQueries( component );
	};

});
