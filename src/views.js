(function ( Anglebars, _ ) {
	
	'use strict';

	var views = Anglebars.views,
		utils = Anglebars.utils;

	views.List = function ( list, parentNode, contextStack, anchor ) {
		var self = this;

		this.items = [];

		_.each( list.items, function ( item, i ) {
			self.items[i] = item.render( parentNode, contextStack, anchor );
		});
	};

	views.List.prototype = {
		teardown: function () {
			// TODO unsubscribes
			_.each( this.items, function ( item ) {
				item.teardown();
			});

			delete this.items; // garbage collector, ATTACK!
		}
	};

	views.Text = function ( textItem, parentNode, contextStack, anchor ) {
		this.node = document.createTextNode( textItem.text );
		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Text.prototype = {
		teardown: function () {
			utils.remove( this.node );
		}
	};

	views.Section = function ( section, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formatted,
			anglebars = section.anglebars,
			data = anglebars.data;

		this.section = section;
		this.contextStack = contextStack || [];
		this.data = data;
		this.views = [];
		
		this.parentNode = parentNode;
		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor || null );

		data.getAddress( this, section.keypath, contextStack, function ( address ) {
			unformatted = data.get( address );
			formatted = anglebars.format( unformatted, section.formatters );

			this.update( formatted );

			// subscribe to changes
			this.subscriptionRefs = data.subscribe( address, section.level, function ( value ) {
				var formatted = anglebars.format( value, section.formatters );
				self.update( formatted );
			});
		});
	};

	views.Section.prototype = {
		teardown: function () {
			this.unrender();

			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.anchor );
		},

		unrender: function () {
			// TODO unsubscribe
			while ( this.views.length ) {
				this.views.shift().teardown();
			}
		},

		update: function ( value ) {
			var emptyArray, i;
			
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
					if ( _.isArray( value ) ) {
						if ( emptyArray ) {
							return;
						}
						
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
		}
	};

	views.Interpolator = function ( interpolator, parentNode, contextStack, anchor ) {
		var self = this,
			value,
			formatted,
			anglebars = interpolator.anglebars,
			data = anglebars.data;

		contextStack = ( contextStack ? contextStack.concat() : [] );
		
		
		this.node = document.createTextNode( '' );
		this.data = data;
		this.keypath = interpolator.keypath;
		this.contextStack = contextStack;

		data.getAddress( this, interpolator.keypath, contextStack, function ( address ) {
			value = data.get( address );
			formatted = anglebars.format( value, interpolator.formatters );

			this.update( formatted );

			this.subscriptionRefs = data.subscribe( address, interpolator.level, function ( value ) {
				var formatted = anglebars.format( value, interpolator.formatters );
				self.update( formatted );
			});
		});
		

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Interpolator.prototype = {
		teardown: function () {
			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.node );
		},

		update: function ( value ) {
			this.node.data = value;
		}
	};

	views.Triple = function ( triple, parentNode, contextStack, anchor ) {
		var self = this,
			unformatted,
			formattedHtml,
			anglebars = this.anglebars = triple.anglebars,
			data = anglebars.data,
			nodes;

		this.nodes = [];
		this.data = data;

		this.anchor = utils.createAnchor();

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.anchor, anchor || null );

		data.getAddress( this, triple.keypath, contextStack, function ( address ) {
			// subscribe to data changes
			this.subscriptionRefs = data.subscribe( address, triple.level, function ( value ) {
				var formatted = anglebars.format( value, triple.formatters );
				self.update( formatted );
			});

			unformatted = data.get( address );
			formattedHtml = anglebars.format( unformatted, triple.formatters );

			this.update( formattedHtml );
		});
	};

	views.Triple.prototype = {
		teardown: function () {
			// TODO unsubscribes
			_.each( this.nodes, utils.remove );


			if ( !this.subscriptionRefs ) {
				this.data.cancelAddressResolution( this );
			} else {
				this.data.unsubscribeAll( this.subscriptionRefs );
			}

			utils.remove( this.anchor );
		},

		update: function ( value ) {
			var self = this;

			if ( _.isEqual( this.value, value ) ) {
				return;
			}

			// remove existing nodes
			_.each( this.nodes, utils.remove );

			// get new nodes
			this.nodes = utils.getNodeArrayFromHtml( value, false );

			_.each( this.nodes, function ( node ) {
				utils.insertBefore( self.anchor, node );
			});
		}
	};

	views.Element = function ( element, parentNode, contextStack, anchor ) {

		var self = this,
			unformatted,
			formattedHtml,
			anglebars = element.anglebars,
			data = anglebars.data,
			i,
			numAttributes,
			numItems,
			attributeModel,
			item,
			nodes;

		// stuff we'll need later
		this.data = data;

		// create the DOM node
		this.node = document.createElement( element.type );
		
		// set attributes
		this.attributes = [];
		numAttributes = element.attributes.length;
		for ( i=0; i<numAttributes; i+=1 ) {
			attributeModel = element.attributes[i];
			this.attributes[i] = attributeModel.render( this.node, contextStack );
		}

		// append children
		if ( element.children ) {
			this.children = [];
			numItems = element.children.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				item = element.children.items[i];
				this.children[i] = item.render( this.node, contextStack );
			}
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		parentNode.insertBefore( this.node, anchor || null );
	};

	views.Element.prototype = {
		teardown: function () {
			_.each( this.attributes, function ( attributeView ) {
				attributeView.teardown();
			});
			utils.remove( this.node );
		}
	};

	views.Attribute = function ( attributeModel, node, contextStack ) {
		
		var i, numItems, item;

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( !attributeModel.isDynamic ) {
			node.setAttribute( attributeModel.name, attributeModel.value );
			return;
		}

		// otherwise we need to do some work
		this.attributeModel = attributeModel;
		this.node = node;
		this.name = attributeModel.name;

		this.anglebars = attributeModel.anglebars;
		this.data = attributeModel.data;

		this.evaluators = [];

		numItems = attributeModel.list.items.length;
		for ( i=0; i<numItems; i+=1 ) {
			item = attributeModel.list.items[i];
			this.evaluators[i] = item.getEvaluator( this, contextStack );
		}

		// update...
		this.update();

		// and watch for changes TODO
	};

	views.Attribute.prototype = {
		teardown: function () {
			_.each( this.evaluators, function ( evaluator ) {
				if ( evaluator.teardown ) {
					evaluator.teardown();
				}
			});
		},

		bubble: function () {
			this.update();
		},

		update: function () {
			this.value = this.toString();
			this.node.setAttribute( this.name, this.value );
		},

		toString: function () {
			var string = '', i, numEvaluators, evaluator;

			numEvaluators = this.evaluators.length;
			for ( i=0; i<numEvaluators; i+=1 ) {
				evaluator = this.evaluators[i];
				string += evaluator.toString();
			}

			return string;
		}
	};

}( Anglebars, _ ));

