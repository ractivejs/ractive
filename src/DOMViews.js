(function ( A ) {

	'use strict';

	var view, views, utils;

	utils = A.utils;

	// View constructor factory
	view = A.view = function ( proto ) {
		var View;

		View = function ( options ) {
			
			var formatters      = options.model.formatters;

			this.model          = options.model;
			this.anglebars      = options.anglebars;
			this.viewmodel      = options.anglebars.viewmodel;
			this.parentNode     = options.parentNode;
			this.parentFragment = options.parentFragment;
			this.contextStack   = options.contextStack || [];
			this.anchor         = options.anchor;
			this.index          = options.index;

			this.initialize();

			this.viewmodel.getKeypath( this, options.model.partialKeypath, options.contextStack, function ( keypath ) {
				var value, formatted, self = this;

				value = this.viewmodel.get( keypath );
				this.update( this.anglebars._format( value, formatters ) );

				this.observerRefs = this.viewmodel.observe( keypath, this.model.priority, function ( value ) {
					self.update( self.anglebars._format( value, formatters ) );
					
					if ( self.bubble ) {
						self.bubble();
					}
				});
			});

			// if the last callback didn't run immediately (ie viewmodel.getKeypath didn't succeed)
			// we have a failed lookup. For inverted sections, we need to trigger this.update() so
			// the contents are rendered
			if ( !this.keypath && this.model.inverted ) { // test both section-hood and inverticity in one go
				this.update( false );
			}
		};

		View.prototype = proto;

		return View;
	};


	// View types
	views = A.views;


	// Plain text
	views.Text = function ( options ) {
		this.node = document.createTextNode( options.model.text );
		this.index = options.index;

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		options.parentNode.insertBefore( this.node, options.anchor );
	};

	views.Text.prototype = {
		teardown: function () {
			utils.remove( this.node );
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Interpolator
	views.Interpolator = view({
		initialize: function () {
			this.node = document.createTextNode( '' );

			this.parentNode.insertBefore( this.node, this.anchor || null );
		},

		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			utils.remove( this.node );
		},

		update: function ( value ) {
			this.node.data = value;
		},

		firstNode: function () {
			return this.node;
		}
	});


	// Triple
	views.Triple = view({
		initialize: function () {
			this.nodes = [];

			// this.tripleAnchor = Anglebars.utils.createAnchor();
			// this.parentNode.insertBefore( this.tripleAnchor, this.anchor || null );
		},

		teardown: function () {
			
			// remove child nodes from DOM
			while ( this.nodes.length ) {
				utils.remove( this.nodes.shift() );
			}

			// kill observer(s)
			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			utils.remove( this.anchor );
		},

		firstNode: function () {
			if ( this.nodes[0] ) {
				return this.nodes[0];
			}

			return this.parentFragment.findNextNode( this );
		},

		update: function ( value ) {
			var numNodes, i, anchor;

			// TODO... not sure what's going on here? this.value isn't being set to value,
			// and equality check should already have taken place. Commenting out for now
			// if ( utils.isEqual( this.value, value ) ) {
			// 	return;
			// }

			anchor = ( this.initialised ? this.parentFragment.findNextNode( this ) : this.anchor );

			// remove existing nodes
			numNodes = this.nodes.length;
			for ( i=0; i<numNodes; i+=1 ) {
				utils.remove( this.nodes[i] );
			}

			// get new nodes
			this.nodes = utils.getNodeArrayFromHtml( value, false );

			numNodes = this.nodes.length;
			if ( numNodes ) {
				anchor = this.parentFragment.findNextNode( this );
			}
			for ( i=0; i<numNodes; i+=1 ) {
				this.parentNode.insertBefore( this.nodes[i], anchor );
			}

			this.initialised = true;
		}
	});


	// Element
	views.Element = function ( options ) {

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
				this.attributes[i] = new views.Attribute( attributeModel, options.anglebars, this.node, options.contextStack );
			}
		}

		if ( binding ) {
			this.bind( binding, options.anglebars.lazy );
		}

		// append children
		this.children = new views.Fragment({
			model:        model.children,
			anglebars:    options.anglebars,
			parentNode:   this.node,
			contextStack: options.contextStack,
			anchor:       null
		});

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		options.parentNode.insertBefore( this.node, options.anchor );
	};

	views.Element.prototype = {
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

			utils.remove( this.node );
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Section
	views.Section = view({
		initialize: function () {
			this.views = [];
			this.length = 0; // number of times this section is rendered
		},

		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelAddressResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			utils.remove( this.anchor );
		},

		firstNode: function () {
			if ( this.views[0] ) {
				return this.views[0].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		findNextNode: function ( fragment ) {
			if ( this.views[ fragment.index + 1 ] ) {
				return this.views[ fragment.index + 1 ].firstNode();
			} else {
				return this.parentFragment.findNextNode( this );
			}
		},

		unrender: function () {
			while ( this.views.length ) {
				this.views.shift().teardown();
			}
		},

		update: function ( value ) {
			var emptyArray, i, viewsToRemove, anchor, fragmentOptions;


			fragmentOptions = {
				model:        this.model.children,
				anglebars:    this.anglebars,
				parentNode:   this.parentNode,
				anchor:       this.parentFragment.findNextNode( this ),
				parentSection: this
			};

			// treat empty arrays as false values
			if ( utils.isArray( value ) && value.length === 0 ) {
				emptyArray = true;
			}


			// if section is inverted, only check for truthiness/falsiness
			if ( this.model.inverted ) {
				if ( value && !emptyArray ) {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
						return;
					}
				}

				else {
					if ( !this.length ) {
						anchor = this.parentFragment.findNextNode( this );
						
						// no change to context stack in this situation
						fragmentOptions.contextStack = this.contextStack;
						fragmentOptions.index = 0;

						this.views[0] = new views.Fragment( fragmentOptions );
						this.length = 1;
						return;
					}
				}

				return;
			}


			// otherwise we need to work out what sort of section we're dealing with
			
			// if value is an array, iterate through
			if ( utils.isArray( value ) ) {

				// if the array is shorter than it was previously, remove items
				if ( value.length < this.length ) {
					viewsToRemove = this.views.splice( value.length, this.length - value.length );

					while ( viewsToRemove.length ) {
						viewsToRemove.shift().teardown();
					}
				}

				// otherwise...
				else {

					// first, update existing views
					for ( i=0; i<this.length; i+=1 ) {
						this.viewmodel.update( this.keypath + '.' + i );
					}

					if ( value.length > this.length ) {
						// then add any new ones
						for ( i=this.length; i<value.length; i+=1 ) {
							// append list item to context stack
							fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
							fragmentOptions.index = i;

							this.views[i] = new views.Fragment( fragmentOptions );
						}
					}
				}

				this.length = value.length;
			}

			// if value is a hash...
			else if ( utils.isObject( value ) ) {
				// ...then if it isn't rendered, render it, adding this.keypath to the context stack
				// (if it is already rendered, then any children dependent on the context stack
				// will update themselves without any prompting)
				if ( !this.length ) {
					// append this section to the context stack
					fragmentOptions.contextStack = this.contextStack.concat( this.keypath );
					fragmentOptions.index = 0;

					this.views[0] = new views.Fragment( fragmentOptions );
					this.length = 1;
				}
			}


			// otherwise render if value is truthy, unrender if falsy
			else {

				if ( value && !emptyArray ) {
					if ( !this.length ) {
						// no change to context stack
						fragmentOptions.contextStack = this.contextStack;
						fragmentOptions.index = 0;

						this.views[0] = new views.Fragment( fragmentOptions );
						this.length = 1;
					}
				}

				else {
					if ( this.length ) {
						this.unrender();
						this.length = 0;
					}
				}
			}
		}
	});


	// Fragment
	views.Fragment = function ( options ) {

		var numModels, i, itemOptions;

		this.parentSection = options.parentSection;
		this.index = options.index;

		itemOptions = {
			anglebars:      options.anglebars,
			parentNode:     options.parentNode,
			contextStack:   options.contextStack,
			anchor:         options.anchor,
			parentFragment: this
		};

		this.items = [];

		numModels = options.model.length;
		for ( i=0; i<numModels; i+=1 ) {
			itemOptions.model = options.model[i];
			itemOptions.index = i;

			this.items[i] = views.create( itemOptions );
		}
	};

	views.Fragment.prototype = {
		teardown: function () {
			
			var i, numItems;

			numItems = this.items.length;
			for ( i=0; i<numItems; i+=1 ) {
				this.items[i].teardown();
			}

			delete this.items;
		},

		firstNode: function () {
			if ( this.items[0] ) {
				return this.items[0].firstNode();
			} else {
				if ( this.parentSection ) {
					return this.parentSection.findNextNode( this );
				}
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index;

			index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			} else {
				if ( this.parentSection ) {
					return this.parentSection.findNextNode( this );
				}
			}

			return null;
		}
	};


	// Attribute
	views.Attribute = function ( model, anglebars, parentNode, contextStack ) {
	
		var i, numComponents;

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( !model.isDynamic ) {
			parentNode.setAttribute( model.name, model.value );
			return;
		}

		// otherwise we need to do some work
		this.parentNode = parentNode;
		this.name = model.name;

		this.substrings = [];

		numComponents = model.components.length;
		for ( i=0; i<numComponents; i+=1 ) {
			this.substrings[i] = A.substrings.create({
				model: model.components[i],
				anglebars: anglebars,
				parent: this,
				contextStack: contextStack
			});
		}

		// manually trigger first update
		this.update();
	};

	views.Attribute.prototype = {
		teardown: function () {
			var numSubstrings, i, substring;

			// ignore non-dynamic attributes
			if ( !this.substrings ) {
				return;
			}

			numSubstrings = this.substrings.length;
			for ( i=0; i<numSubstrings; i+=1 ) {
				substring = this.substrings[i];

				if ( substring.teardown ) {
					substring.teardown();
				}
			}
		},

		bubble: function () {
			this.update();
		},

		update: function () {
			this.value = this.toString();
			this.parentNode.setAttribute( this.name, this.value );
		},

		toString: function () {
			var string = '', i, numSubstrings, substring;

			numSubstrings = this.substrings.length;
			for ( i=0; i<numSubstrings; i+=1 ) {
				substring = this.substrings[i];
				string += substring.toString();
			}

			return string;
		}
	};

}( Anglebars ));
