(function ( A ) {

	'use strict';

	var types, insertHtml, doc,
		Text, Element, Partial, Attribute, Interpolator, Triple, Section;

	types = A.types;

	doc = ( typeof window !== 'undefined' ? window.document : null );

	insertHtml = function ( html, docFrag ) {
		var div, nodes = [];

		div = doc.createElement( 'div' );
		div.innerHTML = html;

		while ( div.firstChild ) {
			nodes[ nodes.length ] = div.firstChild;
			docFrag.appendChild( div.firstChild );
		}

		return nodes;
	};

	A.DomFragment = function ( options ) {
		this.docFrag = doc.createDocumentFragment();

		// if we have an HTML string, our job is easy.
		if ( typeof options.model === 'string' ) {
			this.nodes = insertHtml( options.model, this.docFrag );
			return; // prevent the rest of the init sequence
		}

		// otherwise we need to make a proper fragment
		A._Fragment.call( this, options );
	};

	A.DomFragment.prototype = {
		createItem: function ( options ) {
			if ( typeof options.model === 'string' ) {
				return new Text( options, this.docFrag );
			}

			switch ( options.model.type ) {
				case types.INTERPOLATOR: return new Interpolator( options, this.docFrag );
				case types.SECTION: return new Section( options, this.docFrag );
				case types.TRIPLE: return new Triple( options, this.docFrag );

				case types.ELEMENT: return new Element( options, this.docFrag );
				case types.PARTIAL: return new Partial( options, this.docFrag );

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
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			}

			return null;
		}
	};


	// Partials
	Partial = function ( options, docFrag ) {
		this.fragment = new A.DomFragment({
			model:        options.root.partials[ options.model.ref ] || [],
			root:         options.root,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			parent:        this
		});

		docFrag.appendChild( this.fragment.docFrag );
	};

	Partial.prototype = {
		teardown: function () {
			this.fragment.teardown();
		}
	};


	// Plain text
	Text = function ( options, docFrag ) {
		this.node = doc.createTextNode( options.model );
		this.root = options.root;
		this.parentNode = options.parentNode;

		docFrag.appendChild( this.node );
	};

	Text.prototype = {
		teardown: function () {
			if ( this.root.el.contains( this.node ) ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	Element = function ( options, docFrag ) {

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
		this.node = doc.createElementNS( namespace, model.tag );


		

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
					parent:        this
				});

				this.node.appendChild( this.children.docFrag );
			}
		}


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

				this.attributes[ this.attributes.length ] = attr;

				attr.update();
			}
		}


		// two-way binding: if we have e.g. <input name='{{colour}}' value='red' checked>
		// then we want to do view.set( 'colour', 'red' );
		if ( this.updateViewModel ) {
			this.updateViewModel();
		}

		docFrag.appendChild( this.node );
	};

	Element.prototype = {
		teardown: function () {
			// remove the event listeners we added, if we added them
			if ( this.updateViewModel ) {
				this.node.removeEventListener( 'change', this.updateViewModel );
				this.node.removeEventListener( 'keyup', this.updateViewModel );
			}

			if ( this.root.el.contains( this.node ) ) {
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

		var name, value, colonIndex, namespacePrefix, namespace, ancestor, tagName, bindingCandidate;

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
		this.root = options.root;
		this.parentNode = options.parentNode;
		this.name = name;

		this.children = [];

		// share parentFragment with parent element
		this.parentFragment = this.parent.parentFragment;

		this.fragment = new A.TextFragment({
			model: value,
			root: this.root,
			parent: this,
			contextStack: options.contextStack
		});


		// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
		if ( this.root.twoway ) {
			tagName = this.parent.model.tag.toLowerCase();
			bindingCandidate = ( ( this.name === 'name' || this.name === 'value' || this.name === 'checked' ) && ( tagName === 'input' || tagName === 'textarea' || tagName === 'select' ) );
		}

		if ( bindingCandidate ) {
			this.bind( this.root.lazy );
		}


		// manually trigger first update
		this.ready = true;
		//this.update();
	};

	Attribute.prototype = {
		bind: function ( lazy ) {
			// two-way binding logic should go here
			var self = this, viewmodel = this.root.viewmodel, node = this.parentNode, setValue, keypath;

			if ( !this.fragment ) {
				return false; // report failure
			}

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator with no formatters
			if (
				this.fragment.items.length !== 1 ||
				this.fragment.items[0].type !== A.types.INTERPOLATOR
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator';
			}

			this.twoway = true;
			this.interpolator = this.fragment.items[0];

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
			keypath = this.interpolator.keypath || this.interpolator.model.ref;
			

			// checkboxes and radio buttons
			if ( node.type === 'checkbox' || node.type === 'radio' ) {
				// replace actual name attribute
				node.setAttribute( 'name', '{{' + keypath + '}}' );

				if ( this.name.toLowerCase() === 'name' ) {
					this.updateViewModel = function () {
						if ( node.checked ) {
							viewmodel.set( keypath, node.value );
						}
					};
				}

				else {
					this.updateViewModel = function () {
						viewmodel.set( keypath, node.checked );
					};
				}
			}

			else {
				this.updateViewModel = function () {
					var value;

					if ( self.interpolator.model.fmtrs ) {
						value = self.root._format( node.value, self.interpolator.model.fmtrs );
					} else {
						value = node.value;
					}

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
			}
			

			// set initial value
			// TODO do we need to do this? this.updateViewModel();

			node.addEventListener( 'change', this.updateViewModel );

			if ( !lazy ) {
				node.addEventListener( 'keyup', this.updateViewModel );
			}

			return true;
		},

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
			var prevValue, lowerCaseName;

			if ( this.twoway ) {
				lowerCaseName = this.name.toLowerCase();
				this.value = this.interpolator.value;

				if ( lowerCaseName === 'name' && ( this.parentNode.type === 'checkbox' || this.parentNode.type === 'radio' ) ) {
					// we don't actually want to update the name, it's just a reference.
					// instead we want to see if the value of the reference matches the
					// specified value
					if ( this.value === this.parentNode.value ) {
						this.parentNode.checked = true;
					} else {
						this.parentNode.checked = false;
					}

					return; 
				}

				// don't programmatically update focused element
				if ( lowerCaseName === 'value' && doc.activeElement === this.parentNode ) {
					return;
				}

				if ( this.value === undefined ) {
					this.value = ''; // otherwise text fields will contain 'undefined' rather than their placeholder
				}

				if ( this.parentNode[ lowerCaseName ] != this.value ) { // one of the rare cases where we want != rather than !==
					this.parentNode[ lowerCaseName ] = this.value;
				}

				return;
			}
			
			if ( !this.ready ) {
				return; // avoid items bubbling to the surface when we're still initialising
			}

			prevValue = this.value;
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
	Interpolator = function ( options, docFrag ) {
		this.node = doc.createTextNode( '' );
		docFrag.appendChild( this.node );

		// extend Mustache
		A._Mustache.call( this, options );
	};

	Interpolator.prototype = {
		teardown: function () {
			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}

			if ( this.root.el.contains( this.node ) ) {
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
	Triple = function ( options, docFrag ) {
		this.nodes = [];
		this.docFrag = doc.createDocumentFragment();

		this.initialising = true;
		A._Mustache.call( this, options );
		docFrag.appendChild( this.docFrag );
		this.initialising = false;
	};

	Triple.prototype = {
		teardown: function () {

			// remove child nodes from DOM
			if ( this.root.el.contains( this.parentNode ) ) {
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
			if ( html === this.html ) {
				return;
			}

			this.html = html;
			
			// remove existing nodes
			while ( this.nodes.length ) {
				this.parentNode.removeChild( this.nodes.pop() );
			}

			// get new nodes
			this.nodes = insertHtml( html, this.docFrag );

			if ( !this.initialising ) {
				this.parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
			}
		}
	};



	// Section
	Section = function ( options, docFrag ) {
		this.fragments = [];
		this.length = 0; // number of times this section is rendered

		this.docFrag = doc.createDocumentFragment();
		
		this.initialising = true;
		A._Mustache.call( this, options );
		docFrag.appendChild( this.docFrag );
		this.initialising = false;
	};

	Section.prototype = {
		teardown: function () {
			this.unrender();

			if ( !this.observerRefs ) {
				this.viewmodel.cancelKeypathResolution( this );
			} else {
				this.viewmodel.unobserveAll( this.observerRefs );
			}
		},

		firstNode: function () {
			if ( this.fragments[0] ) {
				return this.fragments[0].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		findNextNode: function ( fragment ) {
			if ( this.fragments[ fragment.index + 1 ] ) {
				return this.fragments[ fragment.index + 1 ].firstNode();
			}

			return this.parentFragment.findNextNode( this );
		},

		unrender: function () {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown();
			}
		},

		update: function ( value ) {
			
			A._sectionUpdate.call( this, value );

			if ( !this.initialising ) {
				// we need to insert the contents of our document fragment into the correct place
				this.parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
			}
			
		},

		createFragment: function ( options ) {
			var fragment = new A.DomFragment( options );
			
			this.docFrag.appendChild( fragment.docFrag );
			return fragment;
		}
	};

}( Ractive ));
