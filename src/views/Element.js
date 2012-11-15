Anglebars.views.Element = function ( options ) {

	var i,
		numAttributes,
		numItems,
		attributeModel,
		item,
		binding,
		model;

	// stuff we'll need later
	model = this.model = options.model;
	this.viewmodel = options.anglebars.viewmodel;
	this.parentFragment = options.parentFragment;
	this.index = options.index;

	// create the DOM node
	if ( model.namespace ) {
		this.node = document.createElementNS( model.namespace, model.tag );
	} else {
		this.node = document.createElement( model.tag );
	}

	
	// set attributes
	this.attributes = [];
	numAttributes = model.attributes.length;
	for ( i=0; i<numAttributes; i+=1 ) {
		attributeModel = model.attributes[i];

		// if the attribute name is data-bind, and this is an input or textarea, set up two-way binding
		if ( attributeModel.name === 'data-bind' && ( model.tag === 'INPUT' || model.tag === 'TEXTAREA' ) ) {
			binding = attributeModel.value;
		}

		// otherwise proceed as normal
		else {
			this.attributes[i] = new Anglebars.views.Attribute( attributeModel, options.anglebars, this.node, options.contextStack );
		}
	}

	if ( binding ) {
		this.bind( binding, options.anglebars.lazy );
	}

	// append children
	this.children = new Anglebars.views.Fragment({
		model:        model.children,
		anglebars:    options.anglebars,
		parentNode:   this.node,
		contextStack: options.contextStack,
		anchor:       null
	});

	// append this.node, either at end of parent element or in front of the anchor (if defined)
	options.parentNode.insertBefore( this.node, options.anchor );
};

Anglebars.views.Element.prototype = {
	bind: function ( keypath, lazy ) {
		
		var viewmodel = this.viewmodel, node = this.node, setValue;

		setValue = function () {
			var value = node.value;
			
			// special cases
			if ( value === '0' ) {
				value = 0;
			}

			else if ( value !== '' ) {
				value = +value || value;
			}

			viewmodel.set( keypath, value );
		};

		// set initial value
		setValue();

		// TODO support shite browsers like IE and Opera
		node.addEventListener( 'change', setValue );

		if ( !lazy ) {
			node.addEventListener( 'keyup', setValue );
		}
	},

	teardown: function () {
		
		var numAttrs, i;

		this.children.teardown();

		numAttrs = this.attributes.length;
		for ( i=0; i<numAttrs; i+=1 ) {
			this.attributes[i].teardown();
		}

		Anglebars.utils.remove( this.node );
	},

	firstNode: function () {
		return this.node;
	}
};
