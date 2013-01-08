(function ( A ) {

	'use strict';

	var domViewMustache, DomViews, utils, types, ctors;

	types = A.types;

	ctors = [];
	ctors[ types.TEXT ] = 'Text';
	ctors[ types.INTERPOLATOR ] = 'Interpolator';
	ctors[ types.TRIPLE ] = 'Triple';
	ctors[ types.SECTION ] = 'Section';
	ctors[ types.ELEMENT ] = 'Element';
	ctors[ types.PARTIAL ] = 'Partial';

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

			this.type = options.model.type;

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
			return new DomViews[ ctors[ options.model.type ] ]( options );
		}
	};


	// Fragment
	DomViews.Fragment = function ( options, wait ) {

		var numModels, i, itemOptions, async;

		async = options.anglebars.async;

		this.owner = options.owner;
		this.index = options.index;

		if ( !async ) {
			itemOptions = {
				anglebars:      options.anglebars,
				parentNode:     options.parentNode,
				contextStack:   options.contextStack,
				anchor:         options.anchor,
				parentFragment: this
			};
		}

		this.items = [];
		this.queue = [];

		numModels = options.model.length;
		for ( i=0; i<numModels; i+=1 ) {


			if ( async ) {
				itemOptions = {
					index:          i,
					model:          options.model[i],
					anglebars:      options.anglebars,
					parentNode:     options.parentNode,
					contextStack:   options.contextStack,
					anchor:         options.anchor,
					parentFragment: this
				};

				this.queue[ this.queue.length ] = itemOptions;
			} else {
				itemOptions.model = options.model[i];
				itemOptions.index = i;

				this.items[i] = DomViews.create( itemOptions );
			}
		}

		if ( async && !wait ) {
			options.anglebars.queue( this.queue );
			delete this.queue;
		}
	};

	DomViews.Fragment.prototype = {
		teardown: function () {
			while ( this.items.length ) {
				this.items.pop().teardown();
			}
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


	// Partials
	DomViews.Partial = function ( options ) {
		var compiledPartial;

		this.fragment = new DomViews.Fragment({
			model:        options.anglebars.compiledPartials[ options.model.id ] || [],
			anglebars:    options.anglebars,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			anchor:       options.anchor,
			owner:        this
		});
	};

	DomViews.Partial.prototype = {
		teardown: function () {
			this.fragment.teardown();
		}
	};


	// Plain text
	DomViews.Text = function ( options ) {
		this.node = document.createTextNode( options.model.text );
		this.index = options.index;
		this.anglebars = options.anglebars;
		this.parentNode = options.parentNode;

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	DomViews.Text.prototype = {
		teardown: function () {
			if ( this.anglebars.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	DomViews.Element = function ( options ) {

		var i,
		attributeModel,
		binding,
		model,
		namespace;

		// stuff we'll need later
		model = this.model = options.model;
		this.anglebars = options.anglebars;
		this.viewmodel = options.anglebars.viewmodel;
		this.parentFragment = options.parentFragment;
		this.parentNode = options.parentNode;
		this.index = options.index;

		namespace = model.namespace || this.parentNode.namespaceURI;

		// create the DOM node
		this.node = document.createElementNS( namespace, model.tag );


		// set attributes
		this.attributes = [];
		i = model.attributes.length;
		while ( i-- ) {
			attributeModel = model.attributes[i];

			this.attributes[i] = new DomViews.Attribute({
				model: attributeModel,
				anglebars: options.anglebars,
				parentNode: this.node,
				contextStack: options.contextStack
			});

			// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
			if ( attributeModel.name === 'value' && this.anglebars.twoway && ( model.tag.toLowerCase() === 'input' || model.tag.toLowerCase() === 'textarea' ) ) {
				binding = this.attributes[i];
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
			anchor:       null,
			owner:        this
		});

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	DomViews.Element.prototype = {
		bind: function ( attribute, lazy ) {

			var viewmodel = this.viewmodel, node = this.node, setValue, valid, interpolator, keypath;

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator with no formatters
			valid = true;
			if ( !attribute.children ||
			     ( attribute.children.length !== 1 ) ||
			     ( attribute.children[0].type !== A.types.INTERPOLATOR ) ||
			     ( attribute.children[0].model.formatters && attribute.children[0].model.formatters.length )
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator with no formatters';
			}

			interpolator = attribute.children[0];

			// Hmmm. Not sure if this is the best way to handle this ambiguity...
			//
			// Let's say we were given `value="{{bar}}"`. If the context stack was
			// context stack was `["foo"]`, and `foo.bar` *wasn't* `undefined`, the
			// keypath would be `foo.bar`. Then, any user input would result in
			// `foo.bar` being updated.
			//
			// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
			// left with an unresolved partial keypath - so we are forced to make an
			// assumption. That assumption is that the input in question should
			// be forced to resolve to `bar`, and any user input would affect `bar`
			// and not `foo.bar`.
			//
			// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
			// be explicit when using two-way data-binding about what keypath you're
			// updating. Using it in lists is probably a recipe for confusion...
			keypath = interpolator.keypath || interpolator.model.partialKeypath;

			setValue = function () {
				var value = node.value;

				// special cases
				if ( value === '0' ) {
					value = 0;
				}

				else if ( value !== '' ) {
					value = +value || value;
				}

				// Note: we're counting on `viewmodel.set` recognising that `value` is
				// already what it wants it to be, and short circuiting the process.
				// Rather than triggering an infinite loop...
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
			if ( this.anglebars.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}

			this.children.teardown();

			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Attribute
	DomViews.Attribute = function ( options ) {

		var i, model;

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

		i = model.components.length;
		while ( i-- ) {
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
			// ignore non-dynamic attributes
			if ( !this.children ) {
				return;
			}

			while ( this.children.length ) {
				this.children.pop().teardown();
			}
		},

		bubble: function () {
			this.update();
		},

		update: function () {
			var prevValue = this.value;
			this.value = this.toString();

			if ( this.value !== prevValue ) {
				this.parentNode.setAttribute( this.name, this.value );
			}
		},

		toString: function () {
			return this.children.join( '' );
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
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			if ( this.anglebars.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		update: function ( text ) {
			if ( text !== this.text ) {
				this.text = text;
				this.node.data = text;
			}
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
			if ( this.anglebars.el.contains( this.parentNode ) ) {
				while ( this.nodes.length ) {
					this.parentNode.removeChild( this.nodes.pop() );
				}
			}

			// kill observer(s)
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
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

		update: function ( html ) {
			var numNodes, i, anchor;

			if ( html === this.html ) {
				return;
			} else {
				this.html = html;
			}

			anchor = ( this.initialised ? this.parentFragment.findNextNode( this ) : this.anchor );

			// remove existing nodes
			while ( this.nodes.length ) {
				this.parentNode.removeChild( this.nodes.pop() );
			}

			// get new nodes
			this.nodes = utils.getNodeArrayFromHtml( html, false );

			numNodes = this.nodes.length;
			if ( numNodes ) {
				anchor = this.parentFragment.findNextNode( this );

				for ( i=0; i<numNodes; i+=1 ) {
					this.parentNode.insertBefore( this.nodes[i], anchor );
				}
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
				this.viewmodel.cancelKeypathResolution( this );
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

			if ( this.anglebars.async ) {
				this.queue = [];
			}

			fragmentOptions = {
				model:        this.model.children,
				anglebars:    this.anglebars,
				parentNode:   this.parentNode,
				anchor:       this.parentFragment.findNextNode( this ),
				owner:        this
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
						viewsToRemove.pop().teardown();
					}
				}

				// otherwise...
				else {

					if ( value.length > this.length ) {
						// add any new ones
						for ( i=this.length; i<value.length; i+=1 ) {
							// append list item to context stack
							fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
							fragmentOptions.index = i;

							this.views[i] = new DomViews.Fragment( fragmentOptions, true ); // true to prevent queue being updated in wrong order

							if ( this.anglebars.async ) {
								this.queue = this.queue.concat( this.views[i].queue );
							}
						}

						if ( this.anglebars.async ) {
							this.anglebars.queue( this.queue );
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
