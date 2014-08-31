define(['config/types','config/booleanAttributes','virtualdom/items/Element/Attribute/helpers/determineNameAndNamespace','virtualdom/items/Element/Attribute/helpers/getInterpolator','virtualdom/items/Element/Attribute/helpers/determinePropertyName','circular'],function (types, booleanAttributes, determineNameAndNamespace, getInterpolator, determinePropertyName, circular) {

	'use strict';
	
	var Fragment;
	
	circular.push( function () {
		Fragment = circular.Fragment;
	});
	
	return function Attribute$init ( options ) {
		this.type = types.ATTRIBUTE;
		this.element = options.element;
		this.root = options.root;
	
		determineNameAndNamespace( this, options.name );
	
		// if it's an empty attribute, or just a straight key-value pair, with no
		// mustache shenanigans, set the attribute accordingly and go home
		if ( !options.value || typeof options.value === 'string' ) {
			this.value = booleanAttributes.test( this.name )
				? true
				: options.value || '';
	
			return;
		}
	
		// otherwise we need to do some work
	
		// share parentFragment with parent element
		this.parentFragment = this.element.parentFragment;
	
		this.fragment = new Fragment({
			template: options.value,
			root:     this.root,
			owner:    this
		});
	
		this.value = this.fragment.getValue();
	
	
		// Store a reference to this attribute's interpolator, if its fragment
		// takes the form `{{foo}}`. This is necessary for two-way binding and
		// for correctly rendering HTML later
		this.interpolator = getInterpolator( this );
		this.isBindable = !!this.interpolator && !this.interpolator.isStatic;
	
		// can we establish this attribute's property name equivalent?
		determinePropertyName( this, options );
	
		// mark as ready
		this.ready = true;
	};

});