define(['config/types','utils/warn','virtualdom/items/Component/initialise/createModel/_createModel','virtualdom/items/Component/initialise/createInstance','virtualdom/items/Component/initialise/createBindings','virtualdom/items/Component/initialise/propagateEvents','virtualdom/items/Component/initialise/updateLiveQueries'],function (types, warn, createModel, createInstance, createBindings, propagateEvents, updateLiveQueries) {

	'use strict';
	
	return function Component$init ( options, Component ) {
		var parentFragment,
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
		this.yielder = null;
	
		if ( !Component ) {
			throw new Error( 'Component "' + this.name + '" not found' );
		}
	
		// First, we need to create a model for the component - e.g. if we
		// encounter <widget foo='bar'/> then we need to create a widget
		// with `data: { foo: 'bar' }`.
		//
		// This may involve setting up some bindings, but we can't do it
		// yet so we take some notes instead
		toBind = [];
		data = createModel( this, Component.defaults.data || {}, options.template.a, toBind );
	
		createInstance( this, Component, data, options.template.f );
		createBindings( this, toBind );
		propagateEvents( this, options.template.v );
	
		// intro, outro and decorator directives have no effect
		if ( options.template.t1 || options.template.t2 || options.template.o ) {
			warn( 'The "intro", "outro" and "decorator" directives have no effect on components' );
		}
	
		updateLiveQueries( this );
	};

});