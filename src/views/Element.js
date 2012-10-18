(function ( views, utils, doc ) {

	'use strict';

	views.Element = function ( model, anglebars, parentNode, contextStack, anchor ) {

		var data = anglebars.data,
			i,
			numAttributes,
			numItems,
			attributeModel,
			item;

		// stuff we'll need later
		this.model = model;
		this.data = data;

		// create the DOM node
		if ( model.namespace ) {
			this.node = doc.createElementNS( model.namespace, model.tag );
		} else {
			this.node = doc.createElement( model.tag );
		}
		
		
		// set attributes
		this.attributes = [];
		numAttributes = model.attributes.length;
		for ( i=0; i<numAttributes; i+=1 ) {
			attributeModel = model.attributes[i];
			this.attributes[i] = new views.Attribute( attributeModel, anglebars, this.node, contextStack );
		}

		// append children
		if ( model.children ) {
			this.children = [];
			numItems = model.children.length;
			for ( i=0; i<numItems; i+=1 ) {
				item = model.children[i];
				this.children[i] = views.create( item, anglebars, this.node, contextStack );
			}
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Element.prototype = {
		teardown: function () {
			
			var numAttrs, i;

			numAttrs = this.attributes.length;
			for ( i=0; i<numAttrs; i+=1 ) {
				this.attributes[i].teardown();
			}

			utils.remove( this.node );
		}
	};

}( Anglebars.views, Anglebars.utils, document ));

