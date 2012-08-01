/*jslint white: true, nomen: true */
/*global _, document */


var bindingViews = (function ( _ ) {
	
	'use strict';

	var views = {},
		insertBefore,
		insertAfter,
		remove,
		getNodeArrayFromHtml,
		createAnchor,
		attributeListToArray;

	insertBefore = function ( referenceNode, newNode ) {
		if ( !referenceNode ) {
			throw new Error( 'Can\'t insert before a non-existent node' );
		}

		return referenceNode.parentNode.insertBefore( newNode, referenceNode );
	};

	insertAfter = function ( referenceNode, newNode ) {
		if ( !referenceNode ) {
			throw new Error( 'Can\'t insert before a non-existent node' );
		}

		return referenceNode.parentNode.insertBefore( newNode, referenceNode.nextSibling );
	};

	remove = function ( node ) {
		if ( node.parentNode ) {
			node.parentNode.removeChild( node );
		}
	};

	getNodeArrayFromHtml = function ( innerHTML ) {

		var parser, temp, i, numNodes, nodes = [];

		// test for DOMParser support
		// TODO

		temp = document.createElement( 'div' );
		temp.innerHTML = innerHTML;

		// create array from node list, as node lists have some undesirable properties
		numNodes = temp.childNodes.length;
		for ( i=0; i<numNodes; i+=1 ) {
			nodes[i] = temp.childNodes[i];
		}

		return nodes;
	};

	createAnchor = function () {
		var anchor = document.createElement( 'a' );
		anchor.setAttribute( 'class', 'binding-anchor' );

		return anchor;
	};

	

	


	views.List = function ( list, parentNode, contextStack, anchor ) {
		var self = this;

		this.views = [];

		_.each( list.items, function ( item, i ) {
			if ( item.render ) {
				self.views[i] = item.render( parentNode, contextStack, anchor );
			}
		});
	};

	views.List.prototype = {
		unrender: function () {
			// TODO unsubscribes
			_.each( this.views, function ( view ) {
				view.unrender();
			});
		}
	};

	views.Text = function ( textItem, parentNode, contextStack, anchor ) {
		this.node = document.createTextNode( textItem.text );
		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor );
	};

	views.Text.prototype = {
		unrender: function () {
			remove( this.node );
		}
	};

	views.Section = function ( section, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formatted,
			binding = section.binding,
			viewModel = binding.viewModel;

		this.section = section;
		this.contextStack = contextStack || [];
		this.address = viewModel.getAddress( section.keypath, contextStack );
		this.views = [];
		
		this.parentNode = parentNode;
		this.anchor = createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor );

		unformatted = viewModel.get( this.address );
		formatted = binding._format( unformatted, section.formatters );

		this.update( formatted );

		// subscribe to changes
		this.subscriptionRefs = viewModel.subscribe( this.address, section.level, function ( value ) {
			var formatted = binding._format( value, section.formatters );
			self.update( formatted );
		});

		
	};

	views.Section.prototype = {
		unrender: function () {
			// TODO unsubscribe
			while ( this.views.length ) {
				this.views.shift().unrender();
			}
		},

		update: function ( value ) {
			var emptyArray, i;

			// if value hasn't changed, don't do anything
			if ( _.isEqual( this.value, value ) ) {
				return;
			}

			// treat empty arrays as false values
			if ( _.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}

			// if section is inverted, only check for truthiness/falsiness
			if ( this.section.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.rendered ) {
						this.unrender();
						this.rendered = false;
						return;
					}
				}

				else {
					if ( !this.rendered ) {
						this.views[0] = this.section.list.render( this.parentNode, this.contextStack, this.anchor );
						this.rendered = true;
						return;
					}
				}

				return;
			}


			// otherwise we need to work out what sort of section we're dealing with
			switch ( typeof value ) {
				case 'object':

					if ( this.rendered ) {
						this.unrender();
						this.rendered = false;
					}

					// if value is an array of hashes, iterate through
					if ( _.isArray( value ) && !emptyArray ) {
						for ( i=0; i<value.length; i+=1 ) {
							this.views[i] = this.section.list.render( this.parentNode, this.contextStack.concat( this.address + '.' + i ), this.anchor );
						}
					}

					// if value is a hash, add it to the context stack and update children
					else {
						this.views[0] = this.section.list.render( this.parentNode, this.contextStack.concat( this.address ), this.anchor );
					}

					this.rendered = true;
					break;

				default:

					if ( value && !emptyArray ) {
						if ( !this.rendered ) {
							this.views[0] = this.section.list.render( this.parentNode, this.contextStack, this.anchor );
							this.rendered = true;
						}
					}

					else {
						if ( this.rendered ) {
							this.unrender();
							this.rendered = false;
						}
					}

					// otherwise render if value is truthy, unrender if falsy

			}
			
			this.value = value;
		}
	};

	views.Interpolator = function ( interpolator, parentNode, contextStack, anchor ) {
		var self = this,
			value,
			formatted,
			binding = interpolator.binding,
			viewModel = binding.viewModel;

		contextStack = ( contextStack ? contextStack.concat() : [] );
		
		this.address = viewModel.getAddress( interpolator.keypath, contextStack );
		this.node = document.createTextNode();

		value = viewModel.get( this.address );
		formatted = binding._format( value, interpolator.formatters );

		this.update( formatted );

		this.subscriptionRefs = viewModel.subscribe( this.address, interpolator.level, function ( value ) {
			var formatted = binding._format( value, interpolator.formatters );
			self.update( formatted );
		});

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor );
	};

	views.Interpolator.prototype = {
		unrender: function () {
			remove( this.node );
			// todo unsubscribe from viewmodel
		},

		update: function ( value ) {
			this.node.textContent = value;
		}
	};

	views.Triple = function ( triple, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formattedHtml,
			binding = triple.binding,
			viewModel = binding.viewModel,
			nodes;

		this.nodes = [];

		this.anchor = createAnchor();

		this.address = viewModel.getAddress( triple.keypath, contextStack );

		// subscribe to viewModel changes
		this.subscriptionRefs = viewModel.subscribe( this.address, triple.level, function ( value ) {
			var formatted = binding._format( value, triple.formatters );
			self.update( formatted );
		});

		unformatted = viewModel.get( this.address );
		formattedHtml = binding._format( unformatted, triple.formatters );

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor );

		this.update( formattedHtml );
	};

	views.Triple.prototype = {
		unrender: function () {
			// TODO unsubscribes
			_.each( this.nodes, remove );
			remove( this.anchor );
		},

		update: function ( value ) {
			var self = this;

			if ( _.isEqual( this.value, value ) ) {
				return;
			}

			// remove existing nodes
			_.each( this.nodes, remove );

			// get new nodes
			this.nodes = getNodeArrayFromHtml( value );

			_.each( this.nodes, function ( node ) {
				insertBefore( self.anchor, node );
			});
		}
	};

	views.Element = function ( element, parentNode, contextStack, anchor ) {

		var self = this,
			unformatted,
			formattedHtml,
			binding = element.binding,
			viewModel = binding.viewModel,
			nodes;

		this.node = document.createElement( element.type );

		if ( element.children ) {
			this.children = [];
			_.each( element.children.items, function ( item, i ) {
				self.children[i] = item.render( self.node, contextStack );
			});
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor );
	};

	views.Element.prototype = {
		unrender: function () {
			// TODO unsubscribes
			remove( this.node );
		}
	};

	return views;
}( _ ));