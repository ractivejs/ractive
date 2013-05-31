(function () {

	var insertHtml, doc, propertyNames,
		Text, Element, Partial, Attribute, Interpolator, Triple, Section;

	// the property name equivalents for element attributes, where they differ
	// from the lowercased attribute name
	propertyNames = {
		'accept-charset': 'acceptCharset',
		accesskey: 'accessKey',
		bgcolor: 'bgColor',
		'class': 'className',
		codebase: 'codeBase',
		colspan: 'colSpan',
		contenteditable: 'contentEditable',
		datetime: 'dateTime',
		dirname: 'dirName',
		'for': 'htmlFor',
		'http-equiv': 'httpEquiv',
		ismap: 'isMap',
		maxlength: 'maxLength',
		novalidate: 'noValidate',
		pubdate: 'pubDate',
		readonly: 'readOnly',
		rowspan: 'rowSpan',
		tabindex: 'tabIndex',
		usemap: 'useMap'
	};

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

	DomFragment = function ( options ) {
		this.docFrag = doc.createDocumentFragment();

		// if we have an HTML string, our job is easy.
		if ( typeof options.descriptor === 'string' ) {
			this.nodes = insertHtml( options.descriptor, this.docFrag );
			return; // prevent the rest of the init sequence
		}

		// otherwise we need to make a proper fragment
		initFragment( this, options );
	};

	DomFragment.prototype = {
		createItem: function ( options ) {
			if ( typeof options.descriptor === 'string' ) {
				return new Text( options, this.docFrag );
			}

			switch ( options.descriptor.t ) {
				case INTERPOLATOR: return new Interpolator( options, this.docFrag );
				case SECTION: return new Section( options, this.docFrag );
				case TRIPLE: return new Triple( options, this.docFrag );

				case ELEMENT: return new Element( options, this.docFrag );
				case PARTIAL: return new Partial( options, this.docFrag );

				default: throw 'WTF? not sure what happened here...';
			}
		},

		teardown: function ( detach ) {
			var node;

			// if this was built from HTML, we just need to remove the nodes
			if ( detach && this.nodes ) {
				while ( this.nodes.length ) {
					node = this.nodes.pop();
					node.parentNode.removeChild( node );
				}
				return;
			}

			// otherwise we need to do a proper teardown
			while ( this.items.length ) {
				this.items.pop().teardown( detach );
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
		this.parentFragment = options.parentFragment;

		this.fragment = new DomFragment({
			descriptor:   options.root.partials[ options.descriptor.r ] || [],
			root:         options.root,
			parentNode:   options.parentNode,
			contextStack: options.contextStack,
			owner:        this
		});

		docFrag.appendChild( this.fragment.docFrag );
	};

	Partial.prototype = {
		teardown: function ( detach ) {
			this.fragment.teardown( detach );
		}
	};


	// Plain text
	Text = function ( options, docFrag ) {
		this.node = doc.createTextNode( options.descriptor );
		this.root = options.root;
		this.parentNode = options.parentNode;

		docFrag.appendChild( this.node );
	};

	Text.prototype = {
		teardown: function ( detach ) {
			if ( detach ) {
				this.parentNode.removeChild( this.node );
			}
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Element
	Element = function ( options, docFrag ) {

		var descriptor,
			namespace,
			eventName,
			attr,
			attrName,
			lcName,
			attrValue,
			bindable,
			twowayNameAttr,
			parentNode,
			root,
			transitionManager,
			intro;

		// stuff we'll need later
		descriptor = this.descriptor = options.descriptor;
		this.root = root = options.root;
		this.parentFragment = options.parentFragment;
		this.parentNode = options.parentNode;
		this.index = options.index;

		this.eventListeners = [];
		this.customEventListeners = [];

		// get namespace
		if ( descriptor.a && descriptor.a.xmlns ) {
			namespace = descriptor.a.xmlns;

			// check it's a string!
			if ( typeof namespace !== 'string' ) {
				throw new Error( 'Namespace attribute cannot contain mustaches' );
			}
		} else {
			namespace = this.parentNode.namespaceURI;
		}
		

		// create the DOM node
		this.node = doc.createElementNS( namespace, descriptor.e );


		

		// append children, if there are any
		if ( descriptor.f ) {
			if ( typeof descriptor.f === 'string' && this.node.namespaceURI === namespaces.html ) {
				// great! we can use innerHTML
				this.node.innerHTML = descriptor.f;
			}

			else {
				this.fragment = new DomFragment({
					descriptor:   descriptor.f,
					root:         root,
					parentNode:   this.node,
					contextStack: options.contextStack,
					owner:        this
				});

				this.node.appendChild( this.fragment.docFrag );
			}
		}


		// create event proxies
		if ( descriptor.v ) {
			for ( eventName in descriptor.v ) {
				if ( descriptor.v.hasOwnProperty( eventName ) ) {
					this.addEventProxy( eventName, descriptor.v[ eventName ], options.contextStack );
				}
			}
		}


		// set attributes
		this.attributes = [];
		bindable = []; // save these till the end

		for ( attrName in descriptor.a ) {
			if ( descriptor.a.hasOwnProperty( attrName ) ) {
				attrValue = descriptor.a[ attrName ];

				// are we dealing with transitions?
				lcName = attrName.toLowerCase();
				if ( lcName === 'intro' || lcName === 'outro' ) {
					this[ lcName ] = attrValue;
					// TODO allow mustaches as transition names?
				}

				else {
					attr = new Attribute({
						element:      this,
						name:         attrName,
						value:        ( attrValue === undefined ? null : attrValue ),
						root:         root,
						parentNode:   this.node,
						contextStack: options.contextStack
					});

					this.attributes[ this.attributes.length ] = attr;

					if ( attr.isBindable ) {
						bindable.push( attr );
					}

					if ( attr.isTwowayNameAttr ) {
						twowayNameAttr = attr;
					} else {
						attr.update();
					}
				}
			}
		}

		while ( bindable.length ) {
			bindable.pop().bind( this.root.lazy );
		}

		if ( twowayNameAttr ) {
			twowayNameAttr.updateViewModel();
			twowayNameAttr.update();
		}

		docFrag.appendChild( this.node );

		// trigger intro transition
		if ( this.intro ) {
			intro = root.transitions[ this.intro ] || Ractive.transitions[ this.intro ];

			if ( intro ) {
				transitionManager = root._transitionManager;

				if ( transitionManager ) {
					transitionManager.push();
				}

				intro.call( root, this.node, ( transitionManager ? transitionManager.pop : noop ) );
			}
		}
	};

	Element.prototype = {
		addEventProxy: function ( eventName, proxy, contextStack ) {
			var self = this, root = this.root, definition, listener, fragment, handler;

			if ( typeof proxy === 'string' ) {
				// If the proxy is a string (e.g. <a proxy-click='select'>{{item}}</a>) then
				// we can reuse the handler. This eliminates the need for event delegation
				if ( !root._proxies[ proxy ] ) {
					root._proxies[ proxy ] = function ( event ) {
						root.fire( proxy, event, this );
					};
				}

				handler = root._proxies[ proxy ];
			}

			else {
				// Otherwise we need to evalute the fragment each time the handler is called
				fragment = new TextFragment({
					descriptor:   proxy,
					root:         this.root,
					owner:        this,
					contextStack: contextStack
				});

				handler = function ( event ) {
					root.fire( fragment.toString(), event, self.node );
				};
			}

			// Is this a custom event?
			if ( definition = Ractive.eventDefinitions[ eventName ] ) {
				// Use custom event. Apply definition to this node
				listener = definition( this.node, handler );
				this.customEventListeners[ this.customEventListeners.length ] = listener;
			}

			// If not, we just need to check it is a valid event for this element
			else {
				// use standard event, if it is valid
				if ( this.node[ 'on' + eventName ] !== undefined ) {
					this.eventListeners[ this.eventListeners.length ] = {
						n: eventName,
						h: handler
					};

					this.node.addEventListener( eventName, handler );
				} else {
					if ( console && console.warn ) {
						console.warn( 'Invalid event handler (' + eventName + ')' );
					}
				}
			}
		},

		teardown: function ( detach ) {
			var self = this, tearThisDown, transitionManager, outro;

			// Children first. that way, any transitions on child elements will be
			// handled by the current transitionManager
			if ( self.fragment ) {
				self.fragment.teardown( false );
			}

			while ( self.attributes.length ) {
				self.attributes.pop().teardown();
			}

			while ( self.eventListeners.length ) {
				listener = self.eventListeners.pop();
				self.node.removeEventListener( listener.n, listener.h );
			}

			while ( self.customEventListeners.length ) {
				self.customEventListeners.pop().teardown();
			}

			if ( this.outro ) {
				outro = this.root.transitions[ this.outro ] || Ractive.transitions[ this.outro ];

				if ( outro ) {
					transitionManager = this.root._transitionManager;
					
					if ( transitionManager ) {
						transitionManager.push();
					}

					outro.call( this.root, this.node, function () {
						if ( detach ) {
							self.parentNode.removeChild( self.node );
						}

						if ( transitionManager ) {
							transitionManager.pop();
						}
					});
				}
			} else if ( detach ) {
				self.parentNode.removeChild( self.node );
			}
		},

		firstNode: function () {
			return this.node;
		},

		bubble: function () {
			// noop - just so event proxy fragments have something to call
		}
	};


	// Attribute
	Attribute = function ( options ) {

		var name,
			value,
			colonIndex,
			namespacePrefix,
			tagName,
			bindingCandidate,
			lowerCaseName,
			propertyName,
			i,
			item,
			containsInterpolator;

		name = options.name;
		value = options.value;

		// are we dealing with a namespaced attribute, e.g. xlink:href?
		colonIndex = name.indexOf( ':' );
		if ( colonIndex !== -1 ) {

			// looks like we are, yes...
			namespacePrefix = name.substr( 0, colonIndex );

			// ...unless it's a namespace *declaration*
			if ( namespacePrefix !== 'xmlns' ) {
				name = name.substring( colonIndex + 1 );
				this.namespace = namespaces[ namespacePrefix ];

				if ( !this.namespace ) {
					throw 'Unknown namespace ("' + namespacePrefix + '")';
				}
			}
		}

		// if it's an empty attribute, or just a straight key-value pair, with no
		// mustache shenanigans, set the attribute accordingly
		if ( value === null || typeof value === 'string' ) {
			
			if ( this.namespace ) {
				options.parentNode.setAttributeNS( this.namespace, name, value );
			} else {
				options.parentNode.setAttribute( name, value );
			}

			if ( name.toLowerCase() === 'id' ) {
				options.root.nodes[ value ] = options.parentNode;
			}

			this.name = name;
			this.value = value;
			
			return;
		}

		// otherwise we need to do some work
		this.root = options.root;
		this.element = options.element;
		this.parentNode = options.parentNode;
		this.name = name;
		this.lcName = name.toLowerCase();

		// can we establish this attribute's property name equivalent?
		if ( !this.namespace && options.parentNode.namespaceURI === namespaces.html ) {
			lowerCaseName = this.lcName;
			propertyName = propertyNames[ lowerCaseName ] || lowerCaseName;

			if ( options.parentNode[ propertyName ] !== undefined ) {
				this.propertyName = propertyName;
			}

			// is this a boolean attribute or 'value'? If so we're better off doing e.g.
			// node.selected = true rather than node.setAttribute( 'selected', '' )
			if ( typeof options.parentNode[ propertyName ] === 'boolean' || propertyName === 'value' ) {
				this.useProperty = true;
			}
		}

		// share parentFragment with parent element
		this.parentFragment = this.element.parentFragment;

		this.fragment = new TextFragment({
			descriptor:   value,
			root:         this.root,
			owner:        this,
			contextStack: options.contextStack
		});


		// determine whether this attribute can be marked as self-updating
		this.selfUpdating = true;

		i = this.fragment.items.length;
		while ( i-- ) {
			item = this.fragment.items[i];
			if ( item.type === TEXT ) {
				continue;
			}

			// we can only have one interpolator and still be self-updating
			if ( item.type === INTERPOLATOR ) {
				if ( containsInterpolator ) {
					this.selfUpdating = false;
					break;
				} else {
					containsInterpolator = true;
					continue;
				}
			}

			// anything that isn't text or an interpolator (i.e. a section)
			// and we can't self-update
			this.selfUpdating = false;
			break;
		}


		// if two-way binding is enabled, and we've got a dynamic `value` attribute, and this is an input or textarea, set up two-way binding
		if ( this.root.twoway ) {
			tagName = this.element.descriptor.e.toLowerCase();
			bindingCandidate = ( ( propertyName === 'name' || propertyName === 'value' || propertyName === 'checked' ) && ( tagName === 'input' || tagName === 'textarea' || tagName === 'select' ) );
		}

		if ( bindingCandidate ) {
			this.isBindable = true;

			// name attribute is a special case - it is the only two-way attribute that updates
			// the viewmodel based on the value of another attribute. For that reason it must wait
			// until the node has been initialised, and the viewmodel has had its first two-way
			// update, before updating itself (otherwise it may disable a checkbox or radio that
			// was enabled in the template)
			if ( propertyName === 'name' ) {
				this.isTwowayNameAttr = true;
			}
		}


		// mark as ready
		this.ready = true;
	};

	Attribute.prototype = {
		bind: function ( lazy ) {
			// two-way binding logic should go here
			var self = this, node = this.parentNode, keypath, index, options, option, i, len;

			if ( !this.fragment ) {
				return false; // report failure
			}

			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator
			if (
				this.fragment.items.length !== 1 ||
				this.fragment.items[0].type !== INTERPOLATOR
			) {
				throw 'Not a valid two-way data binding candidate - must be a single interpolator';
			}

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
			keypath = this.interpolator.keypath || this.interpolator.descriptor.r;
			
			
			// select
			if ( node.tagName === 'SELECT' && this.propertyName === 'value' ) {
				// We need to know if one of the options was selected, so we
				// can initialise the viewmodel. To do that we need to jump
				// through a couple of hoops
				options = node.getElementsByTagName( 'option' );

				len = options.length;
				for ( i=0; i<len; i+=1 ) {
					option = options[i];
					if ( option.hasAttribute( 'selected' ) ) { // not option.selected - won't work here
						this.root.set( keypath, option.value );
						break;
					}
				}
			}

			// checkboxes and radio buttons
			if ( node.type === 'checkbox' || node.type === 'radio' ) {
				// We might have a situation like this: 
				//
				//     <input type='radio' name='{{colour}}' value='red'>
				//     <input type='radio' name='{{colour}}' value='blue'>
				//     <input type='radio' name='{{colour}}' value='green'>
				//
				// In this case we want to set `colour` to the value of whichever option
				// is checked. (We assume that a value attribute has been supplied.)

				if ( this.propertyName === 'name' ) {
					// replace actual name attribute
					node.name = '{{' + keypath + '}}';

					this.updateViewModel = function () {
						if ( node.checked ) {
							self.root.set( keypath, node.value );
						}
					};
				}


				// Or, we might have a situation like this:
				//
				//     <input type='checkbox' checked='{{active}}'>
				//
				// Here, we want to set `active` to true or false depending on whether
				// the input is checked.

				else if ( this.propertyName === 'checked' ) {
					this.updateViewModel = function () {
						self.root.set( keypath, node.checked );
					};
				}
			}

			else {
				// Otherwise we've probably got a situation like this:
				//
				//     <input value='{{name}}'>
				//
				// in which case we just want to set `name` whenever the user enters text.
				// The same applies to selects and textareas 
				this.updateViewModel = function () {
					var value;

					value = node.value;

					// special cases
					if ( value === '0' ) {
						value = 0;
					}

					else if ( value !== '' ) {
						value = +value || value;
					}

					// Note: we're counting on `this.root.set` recognising that `value` is
					// already what it wants it to be, and short circuiting the process.
					// Rather than triggering an infinite loop...
					self.root.set( keypath, value );
				};
			}
			

			// if we figured out how to bind changes to the viewmodel, add the event listeners
			if ( this.updateViewModel ) {
				this.twoway = true;

				node.addEventListener( 'change', this.updateViewModel );
				node.addEventListener( 'click',  this.updateViewModel );
				node.addEventListener( 'blur',   this.updateViewModel );

				if ( !lazy ) {
					node.addEventListener( 'keyup',    this.updateViewModel );
					node.addEventListener( 'keydown',  this.updateViewModel );
					node.addEventListener( 'keypress', this.updateViewModel );
					node.addEventListener( 'input',    this.updateViewModel );
				}
			}
		},

		teardown: function () {
			// remove the event listeners we added, if we added them
			if ( this.updateViewModel ) {
				this.parentNode.removeEventListener( 'change', this.updateViewModel );
				this.parentNode.removeEventListener( 'click', this.updateViewModel );
				this.parentNode.removeEventListener( 'blur', this.updateViewModel );
				this.parentNode.removeEventListener( 'keyup', this.updateViewModel );
				this.parentNode.removeEventListener( 'keydown', this.updateViewModel );
				this.parentNode.removeEventListener( 'keypress', this.updateViewModel );
				this.parentNode.removeEventListener( 'input', this.updateViewModel );
			}

			// ignore non-dynamic attributes
			if ( this.fragment ) {
				this.fragment.teardown();
			}
		},

		bubble: function () {
			// If an attribute's text fragment contains a single item, we can
			// update the DOM immediately...
			if ( this.selfUpdating ) {
				this.update();
			}

			// otherwise we want to register it as a deferred attribute, to be
			// updated once all the information is in, to prevent unnecessary
			// DOM manipulation
			else if ( !this.deferred && this.ready ) {
				this.root._def[ this.root._def.length ] = this;
				this.deferred = true;
			}
		},

		update: function () {
			var value, lowerCaseName;

			if ( !this.ready ) {
				return this; // avoid items bubbling to the surface when we're still initialising
			}

			if ( this.lcName === 'id' ) {
				if ( this.id !== undefined ) {
					delete this.root.nodes[ this.id ];
				}

				this.root.nodes[ this.id ] = this.parentNode;
			}

			if ( this.twoway ) {
				// TODO compare against previous?

				lowerCaseName = this.lcName;
				this.value = this.interpolator.value;

				// special case - if we have an element like this:
				//
				//     <input type='radio' name='{{colour}}' value='red'>
				//
				// and `colour` has been set to 'red', we don't want to change the name attribute
				// to red, we want to indicate that this is the selected option, by setting
				// input.checked = true
				if ( lowerCaseName === 'name' && ( this.parentNode.type === 'checkbox' || this.parentNode.type === 'radio' ) ) {
					if ( this.value === this.parentNode.value ) {
						this.parentNode.checked = true;
					} else {
						this.parentNode.checked = false;
					}

					return this; 
				}

				// don't programmatically update focused element
				if ( doc.activeElement === this.parentNode ) {
					return this;
				}
			}

			value = this.fragment.getValue();

			if ( value === undefined ) {
				value = '';
			}

			if ( value !== this.value ) {
				if ( this.useProperty ) {
					this.parentNode[ this.propertyName ] = value;
					return this;
				}

				if ( this.namespace ) {
					this.parentNode.setAttributeNS( this.namespace, this.name, value );
					return this;
				}

				this.parentNode.setAttribute( this.name, value );

				this.value = value;
			}

			return this;
		}
	};





	// Interpolator
	Interpolator = function ( options, docFrag ) {
		this.node = doc.createTextNode( '' );
		docFrag.appendChild( this.node );

		// extend Mustache
		initMustache( this, options );

		// if this initialised without a keypath, and it's a conditional,
		// we need to use the 'if false' value
		if ( this.cond && !this.keypath ) {
			this.update( false );
		}
	};

	Interpolator.prototype = {
		update: updateMustache,
		resolve: resolveMustache,
		evaluate: evaluateMustache,

		teardown: function ( detach ) {
			teardown( this );
			
			if ( detach ) {
				this.parentNode.removeChild( this.node );
			}
		},

		render: function ( value ) {
			this.node.data = value;
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
		initMustache( this, options );
		docFrag.appendChild( this.docFrag );
		this.initialising = false;
	};

	Triple.prototype = {
		update: updateMustache,
		resolve: resolveMustache,
		evaluate: evaluateMustache,

		teardown: function ( detach ) {

			// remove child nodes from DOM
			if ( detach ) {
				while ( this.nodes.length ) {
					this.parentNode.removeChild( this.nodes.pop() );
				}
			}

			teardown( this );
		},

		firstNode: function () {
			if ( this.nodes[0] ) {
				return this.nodes[0];
			}

			return this.parentFragment.findNextNode( this );
		},

		render: function ( html ) {
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
		initMustache( this, options );
		docFrag.appendChild( this.docFrag );
		this.initialising = false;
	};

	Section.prototype = {
		update: updateMustache,
		resolve: resolveMustache,
		evaluate: evaluateMustache,

		teardown: function ( detach ) {
			this.teardownFragments( detach );

			teardown( this );
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

		teardownFragments: function ( detach ) {
			while ( this.fragments.length ) {
				this.fragments.shift().teardown( detach );
			}
		},

		render: function ( value ) {
			
			updateSection( this, value );

			if ( !this.initialising ) {
				// we need to insert the contents of our document fragment into the correct place
				this.parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
			}
			
		},

		createFragment: function ( options ) {
			var fragment = new DomFragment( options );
			
			this.docFrag.appendChild( fragment.docFrag );
			return fragment;
		}
	};

}());
