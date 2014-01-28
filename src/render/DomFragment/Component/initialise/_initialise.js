define([
	'config/types',
	'utils/warn',
	'shared/attemptKeypathResolution',
	'render/DomFragment/Component/initialise/createModel/_createModel',
	'render/DomFragment/Component/initialise/createInstance',
	'render/DomFragment/Component/initialise/createBindings/_createBindings',
	'render/DomFragment/Component/initialise/propagateEvents',
	'render/DomFragment/Component/initialise/updateLiveQueries',
	'render/DomFragment/Component/initialise/resolveWithAncestors'
], function (
	types,
	warn,
	attemptKeypathResolution,
	createModel,
	createInstance,
	createBindings,
	propagateEvents,
	updateLiveQueries,
	resolveWithAncestors
) {

	'use strict';

	return function ( component, options, docFrag ) {
		var parentFragment,
			root,
			Component,
			data,
			toBind,
			undefs;

		parentFragment = component.parentFragment = options.parentFragment;
		root = parentFragment.root;

		component.root = root;
		component.type = types.COMPONENT;
		component.name = options.descriptor.e;
		component.index = options.index;

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
		undefs = [];
		data = createModel( component, options.descriptor.a, toBind, undefs );

		createInstance( component, Component, data, docFrag, options.descriptor.f );
		createBindings( component, toBind );
		propagateEvents( component, options.descriptor.v );

		// add any undefined keys to the model, so that we don't bypass them when
		// dealing with unresolveds
		undefs.forEach( function ( key ) {
			if ( !component.instance.data.hasOwnProperty( key ) ) {
				component.instance.data[ key ] = undefined;
			}
		});

		// Adding the undefined keys may mean we can resolve some dependants
		attemptKeypathResolution( component.instance );

		// Attempt to resolve unresolved dependants with ancestor data contexts
		component.instance._pendingResolution.forEach( function ( unresolved ) {
			resolveWithAncestors( component, unresolved );
		});

		// intro, outro and decorator directives have no effect
		if ( options.descriptor.t1 || options.descriptor.t2 || options.descriptor.o ) {
			warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
		}

		updateLiveQueries( component );
	};

});
