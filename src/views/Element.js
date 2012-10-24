Anglebars.views.Element = function ( model, anglebars, parentNode, contextStack, anchor ) {

	var data = anglebars.data,
		i,
		numAttributes,
		numItems,
		attributeModel,
		item,
		binding;

	// stuff we'll need later
	this.model = model;
	this.data = data;

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
			this.attributes[i] = new Anglebars.views.Attribute( attributeModel, anglebars, this.node, contextStack );
		}
	}

	if ( binding ) {
		this.bind( binding, anglebars.lazy );
	}

	// append children
	if ( model.children ) {
		this.children = [];
		numItems = model.children.length;
		for ( i=0; i<numItems; i+=1 ) {
			item = model.children[i];
			this.children[i] = Anglebars.views.create( item, anglebars, this.node, contextStack );
		}
	}

	// append this.node, either at end of parent element or in front of the anchor (if defined)
	parentNode.insertBefore( this.node, anchor || null );
};

Anglebars.views.Element.prototype = {
	bind: function ( keypath, lazy ) {
		
		var data = this.data, node = this.node, value, setValue;

		setValue = function () {
			var value = node.value;
			
			// special cases
			if ( value === '0' ) {
				value = 0;
			}

			else if ( value !== '' ) {
				value = +value || value;
			}

			data.set( keypath, value );
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

		numAttrs = this.attributes.length;
		for ( i=0; i<numAttrs; i+=1 ) {
			this.attributes[i].teardown();
		}

		Anglebars.utils.remove( this.node );
	}
};
