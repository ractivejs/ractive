(function ( A ) {

	'use strict';

	var domViewMustache, DomViews, utils;

	utils = A.utils;

	// View constructor factory
	domViewMustache = function ( proto ) {
		var Mustache;

		Mustache = function ( options ) {

			this.model          = options.model;
			this.anglebars      = options.anglebars;
			this.viewmodel      = options.anglebars.viewmodel;
			this.parentNode     = options.parentNode;
			this.parentFragment = options.parentFragment;
			this.contextStack   = options.contextStack || [];
			this.anchor         = options.anchor;
			this.index          = options.index;

			this.initialize();

			this.viewmodel.registerView( this );

			// if we have a failed keypath lookup, and this is an inverted section,
			// we need to trigger this.update() so the contents are rendered
			if ( !this.keypath && this.model.inverted ) { // test both section-hood and inverticity in one go
				this.update( false );
			}
		};

		Mustache.prototype = proto;

		return Mustache;
	};


	// View types
	DomViews = A.DomViews = {
		create: function ( options ) {
			var type = options.model.type;

			// get constructor name by capitalising model type
			type = type.charAt( 0 ).toUpperCase() + type.slice( 1 );

			return new DomViews[ type ]( options );
		}
	};


	// Fragment
	DomViews.Fragment = function ( options ) {

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

			this.items[i] = DomViews.create( itemOptions );
		}
	};

	DomViews.Fragment.prototype = {
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


	// Plain text
	DomViews.Text = function ( options ) {
		this.node = document.createTextNode( options.model.text );
		this.index = options.index;

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		options.parentNode.insertBefore( this.node, options.anchor );
	};

	DomViews.Text.prototype = {
		teardown: function () {
			utils.remove( this.node );
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	DomViews.Element = function ( options ) {

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
				this.attributes[i] = new DomViews.Attribute({
					model: attributeModel,
					anglebars: options.anglebars,
					parentNode: this.node,
					contextStack: options.contextStack
				});
			}
		}

		if ( binding ) {
			this.bind( binding, options.anglebars.lazy );
		}

		// append children
		this.children = new DomViews.Fragment({
			model:        model.children,
			anglebars:    options.anglebars,
			parentNode:   this.node,
			contextStack: options.contextStack,
			anchor:       null
		});

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		options.parentNode.insertBefore( this.node, options.anchor );
	};

	DomViews.Element.prototype = {
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


	// Attribute
	DomViews.Attribute = function ( options ) {

		var i, numComponents, model;

		model = options.model;

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( !model.isDynamic ) {
			options.parentNode.setAttribute( model.name, model.value );
			return;
		}

		// otherwise we need to do some work
		this.parentNode = options.parentNode;
		this.name = model.name;

		this.children = [];

		numComponents = model.components.length;
		for ( i=0; i<numComponents; i+=1 ) {
			this.children[i] = A.TextViews.create({
				model:        model.components[i],
				anglebars:    options.anglebars,
				parent:       this,
				contextStack: options.contextStack
			});
		}

		// manually trigger first update
		this.update();
	};

	DomViews.Attribute.prototype = {
		teardown: function () {
			var numChildren, i, child;

			// ignore non-dynamic attributes
			if ( !this.children ) {
				return;
			}

			numChildren = this.children.length;
			for ( i=0; i<numChildren; i+=1 ) {
				child = this.children[i];

				if ( child.teardown ) {
					child.teardown();
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
			var string = '', i, numChildren, child;

			numChildren = this.children.length;
			for ( i=0; i<numChildren; i+=1 ) {
				child = this.children[i];
				string += child.toString();
			}

			return string;
		}
	};





	// Interpolator
	DomViews.Interpolator = domViewMustache({
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
	DomViews.Triple = domViewMustache({
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



	// Section
	DomViews.Section = domViewMustache({
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

						this.views[0] = new DomViews.Fragment( fragmentOptions );
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

							this.views[i] = new DomViews.Fragment( fragmentOptions );
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

					this.views[0] = new DomViews.Fragment( fragmentOptions );
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

						this.views[0] = new DomViews.Fragment( fragmentOptions );
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

}( Anglebars ));
