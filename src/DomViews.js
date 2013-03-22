(function ( A ) {

	'use strict';

	var types, insertHtml, isArray, isObject, elContains,
		Text, Element, Partial, Attribute, Interpolator, Triple, Section;

	types = A.types;

	isArray = A.isArray;
	isObject = A.isObject;

	elContains = function ( haystack, needle ) {
		// TODO!
		if ( haystack.contains ) {
			return haystack.contains( needle );
		}

		return true;
	};

	insertHtml = function ( html, parent, anchor ) {
		var div, i, len, nodes = [];

		anchor = anchor || null;

		div = document.createElement( 'div' );
		div.innerHTML = html;

		len = div.childNodes.length;

		for ( i=0; i<len; i+=1 ) {
			nodes[i] = div.childNodes[i];
		}

		for ( i=0; i<len; i+=1 ) {
			parent.insertBefore( nodes[i], anchor );
		}

		return nodes;
	};

	A.DomFragment = function ( options ) {
		A._Fragment.call( this, options );
	};

	A.DomFragment.prototype = {
		preInit: function ( options ) {
			// if we have an HTML string, our job is easy.
			if ( typeof options.model === 'string' ) {
				this.nodes = insertHtml( options.model, options.parentNode, options.anchor );
				return true; // prevent the rest of the init sequence
			}
		},

		createItem: function ( options ) {
			if ( typeof options.model === 'string' ) {
				return new Text( options );
			}

			switch ( options.model.type ) {
				case types.INTERPOLATOR: return new Interpolator( options );
				case types.SECTION: return new Section( options );
				case types.TRIPLE: return new Triple( options );

				case types.ELEMENT: return new Element( options );
				case types.PARTIAL: return new Partial( options );

				default: throw 'WTF? not sure what happened here...';
			}
		},

		teardown: function () {
			var node;

			// if this was built from HTML, we just need to remove the nodes
			if ( this.nodes ) {
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
				return;
			}

			// otherwise we need to do a proper teardown
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
	Partial = function ( options ) {
		this.fragment = new A.DomFragment({
			model:        options.root.partials[ options.model.ref ] || [],
			root:         options.root,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			anchor:       options.anchor,
			parent:        this
		});
	};

	Partial.prototype = {
		teardown: function () {
			this.fragment.teardown();
		}
	};


	// Plain text
	Text = function ( options ) {
		this.node = document.createTextNode( options.model );
		this.index = options.index;
		this.root = options.root;
		this.parentNode = options.parentNode;

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	Text.prototype = {
		teardown: function () {
			if ( elContains( this.root.el, this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	Element = function ( options ) {

		var binding,
			model,
			namespace,
			attr,
			attrName,
			attrValue;

		// stuff we'll need later
		model = this.model = options.model;
		this.root = options.root;
		this.viewmodel = options.root.viewmodel;
		this.parentFragment = options.parentFragment;
		this.parentNode = options.parentNode;
		this.index = options.index;

		// get namespace
		if ( model.attrs && model.attrs.xmlns ) {
			namespace = model.attrs.xmlns;

			// check it's a string!
			if ( typeof namespace !== 'string' ) {
				throw 'Namespace attribute cannot contain mustaches';
			}
		} else {
			namespace = this.parentNode.namespaceURI;
		}
		

		// create the DOM node
		this.node = document.createElementNS( namespace, model.tag );


		// set attributes
		this.attributes = [];
		for ( attrName in model.attrs ) {
			if ( model.attrs.hasOwnProperty( attrName ) ) {
				attrValue = model.attrs[ attrName ];

				attr = new Attribute({
					parent: this,
					name: attrName,
					value: attrValue,
					root: options.root,
					parentNode: this.node,
					contextStack: options.contextStack
				});

				// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
				if ( attrName === 'value' && this.root.twoway && ( model.tag.toLowerCase() === 'input' || model.tag.toLowerCase() === 'textarea' ) ) {
					binding = attr;
				}

				this.attributes[ this.attributes.length ] = attr;
			}
		}

		if ( binding ) {
			this.bind( binding, options.root.lazy );
		}

		// append children, if there are any
		if ( model.frag ) {
			if ( typeof model.frag === 'string' ) {
				// great! we can use innerHTML
				this.node.innerHTML = model.frag;
			}

			else {
				this.children = new A.DomFragment({
					model:        model.frag,
					root:    options.root,
					parentNode:   this.node,
					contextStack: options.contextStack,
					anchor:       null,
					parent:        this
				});
			}
		}

		// append this.node, either at end of parent element or in front of the anchor (if defined)
		this.parentNode.insertBefore( this.node, options.anchor || null );
	};

	Element.prototype = {
		bind: function ( attribute, lazy ) {

			var viewmodel = this.viewmodel, node = this.node, setValue, valid, interpolator, keypath;

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator with no formatters
			valid = true;
			if ( !attribute.fragment ||
			     ( attribute.fragment.items.length !== 1 ) ||
			     ( attribute.fragment.items[0].type !== A.types.INTERPOLATOR ) ||
			     ( attribute.fragment.items[0].model.formatters && attribute.fragment.items[0].model.formatters.length )
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator with no formatters';
			}

			interpolator = attribute.fragment.items[0];

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
			if ( elContains( this.root.el, this.node ) ) {
				this.parentNode.removeChild( this.node );
			}

			if ( this.children ) {
				this.children.teardown();
			}

			while ( this.attributes.length ) {
				this.attributes.pop().teardown();
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Attribute
	Attribute = function ( options ) {

		var i, name, value, colonIndex, namespacePrefix, namespace, ancestor;

		name = options.name;
		value = options.value;

		this.parent = options.parent; // the element this belongs to

		// are we dealing with a namespaced attribute, e.g. xlink:href?
		colonIndex = name.indexOf( ':' );
		if ( colonIndex !== -1 ) {

			// looks like we are, yes...
			namespacePrefix = name.substr( 0, colonIndex );

			// ...unless it's a namespace *declaration*
			if ( namespacePrefix === 'xmlns' ) {
				namespace = null;
			}

			else {

				// we need to find an ancestor element that defines this prefix
				ancestor = options.parentNode;

				// continue searching until there's nowhere further to go, or we've found the declaration
				while ( ancestor && !namespace ) {
					namespace = ancestor.getAttribute( 'xmlns:' + namespacePrefix );

					// continue searching possible ancestors
					ancestor = ancestor.parentNode || options.parent.parentFragment.parent.node || options.parent.parentFragment.parent.parentNode;
				}
			}

			// if we've found a namespace, make a note of it
			if ( namespace ) {
				this.namespace = namespace;
			}
		}

		// if it's just a straight key-value pair, with no mustache shenanigans, set the attribute accordingly
		if ( typeof value === 'string' ) {
			
			if ( namespace ) {
				options.parentNode.setAttributeNS( namespace, name.replace( namespacePrefix + ':', '' ), value );
			} else {
				options.parentNode.setAttribute( name, value );
			}
			
			return;
		}

		// otherwise we need to do some work
		this.parentNode = options.parentNode;
		this.name = name;

		this.children = [];

		// share parentFragment with parent element
		this.parentFragment = this.parent.parentFragment;

		this.fragment = new A.TextFragment({
			model:        value,
			root:    options.root,
			parent:        this,
			contextStack: options.contextStack
		});

		// manually trigger first update
		this.ready = true;
		this.update();
	};

	Attribute.prototype = {
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

			if ( !this.ready ) {
				return; // avoid items bubbling to the surface when we're still initialising
			}
			
			this.value = this.fragment.toString();

			if ( this.value !== prevValue ) {
				if ( this.namespace ) {
					this.parentNode.setAttributeNS( this.namespace, this.name, this.value );
				} else {
					this.parentNode.setAttribute( this.name, this.value );
				}
			}
		}
	};





	// Interpolator
	Interpolator = function ( options ) {
		// extend Mustache
		A._Mustache.call( this, options );
	};

	Interpolator.prototype = {
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

			if ( elContains( this.root.el, this.node ) ) {
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
	};


	// Triple
	Triple = function ( options ) {
		A._Mustache.call( this, options );
	};

	Triple.prototype = {
		initialize: function () {
			this.nodes = [];
		},

		teardown: function () {

			// remove child nodes from DOM
			if ( elContains( this.root.el, this.parentNode ) ) {
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
			var anchor;

			if ( html === this.html ) {
				return;
			} else {
				this.html = html;
			}

			// TODO figure out if this line was supposed to mean something...
			//anchor = ( this.initialised ? this.parentFragment.findNextNode( this ) : this.anchor );

			// remove existing nodes
			while ( this.nodes.length ) {
				this.parentNode.removeChild( this.nodes.pop() );
			}

			anchor = this.anchor || this.parentFragment.findNextNode( this );

			// get new nodes
			this.nodes = insertHtml( html, this.parentNode, anchor );
		}
	};



	// Section
	Section = function ( options ) {
		A._Mustache.call( this, options );
	};

	Section.prototype = {
		initialize: function () {
			this.fragments = [];
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

		update: A._sectionUpdate,

		createFragment: function ( options ) {
			return new A.DomFragment( options );
		}
	};

}( Anglebars ));
