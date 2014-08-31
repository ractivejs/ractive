define(['config/types','virtualdom/items/Element/shared/enforceCase','virtualdom/items/Element/prototype/init/createAttributes','virtualdom/items/Element/prototype/init/createTwowayBinding','virtualdom/items/Element/prototype/init/createEventHandlers','virtualdom/items/Element/Decorator/_Decorator','virtualdom/items/Element/special/select/bubble','virtualdom/items/Element/special/option/init','circular'],function (types, enforceCase, createAttributes, createTwowayBinding, createEventHandlers, Decorator, bubbleSelect, initOption, circular) {

	'use strict';
	
	var Fragment;
	
	circular.push( function () {
		Fragment = circular.Fragment;
	});
	
	return function Element$init ( options ) {
		var parentFragment,
			template,
			ractive,
			binding,
			bindings;
	
		this.type = types.ELEMENT;
	
		// stuff we'll need later
		parentFragment = this.parentFragment = options.parentFragment;
		template = this.template = options.template;
	
		this.parent = options.pElement || parentFragment.pElement;
	
		this.root = ractive = parentFragment.root;
		this.index = options.index;
	
		this.name = enforceCase( template.e );
	
		// Special case - <option> elements
		if ( this.name === 'option' ) {
			initOption( this, template );
		}
	
		// Special case - <select> elements
		if ( this.name === 'select' ) {
			this.options = [];
			this.bubble = bubbleSelect; // TODO this is a kludge
		}
	
		// create attributes
		this.attributes = createAttributes( this, template.a );
	
		// append children, if there are any
		if ( template.f ) {
			this.fragment = new Fragment({
				template: template.f,
				root:     ractive,
				owner:    this,
				pElement: this,
			});
		}
	
		// create twoway binding
		if ( ractive.twoway && ( binding = createTwowayBinding( this, template.a ) ) ) {
			this.binding = binding;
	
			// register this with the root, so that we can do ractive.updateModel()
			bindings = this.root._twowayBindings[ binding.keypath ] || ( this.root._twowayBindings[ binding.keypath ] = [] );
			bindings.push( binding );
		}
	
		// create event proxies
		if ( template.v ) {
			this.eventHandlers = createEventHandlers( this, template.v );
		}
	
		// create decorator
		if ( template.o ) {
			this.decorator = new Decorator( this, template.o );
		}
	
		// create transitions
		this.intro = template.t0 || template.t1;
		this.outro = template.t0 || template.t2;
	};

});