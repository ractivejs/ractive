(function () {

	var insertHtml, propertyNames,
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
			if ( !this.items ) {
				return;
			}

			while ( this.items.length ) {
				this.items.pop().teardown( detach );
			}
		},

		firstNode: function () {
			if ( this.items && this.items[0] ) {
				return this.items[0].firstNode();
			} else if ( this.nodes ) {
				return this.nodes[0] || null;
			}

			return null;
		},

		findNextNode: function ( item ) {
			var index = item.index;

			if ( this.items[ index + 1 ] ) {
				return this.items[ index + 1 ].firstNode();
			}

			// if this is the root fragment, and there are no more items,
			// it means we're at the end
			if ( this.owner === this.root ) {
				return null;
			}

			return this.owner.findNextNode( this );
		}
	};


	// Partials
	Partial = function ( options, docFrag ) {
		var parentFragment = this.parentFragment = options.parentFragment, descriptor;

		this.type = PARTIAL;
		this.name = options.descriptor.r;

		descriptor = getPartialDescriptor( parentFragment.root, options.descriptor.r );

		this.fragment = new DomFragment({
			descriptor:   descriptor,
			root:         parentFragment.root,
			parentNode:   parentFragment.parentNode,
			contextStack: parentFragment.contextStack,
			owner:        this
		});

		docFrag.appendChild( this.fragment.docFrag );
	};

	Partial.prototype = {
		findNextNode: function () {
			return this.parentFragment.findNextNode( this );
		},

		teardown: function ( detach ) {
			this.fragment.teardown( detach );
		}
	};


	// Plain text
	Text = function ( options, docFrag ) {
		this.type = TEXT;

		this.node = doc.createTextNode( options.descriptor );
		this.parentNode = options.parentFragment.parentNode;

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

		var parentFragment,
			descriptor,
			namespace,
			eventName,
			eventNames,
			i,
			attr,
			attrName,
			lcName,
			attrValue,
			bindable,
			twowayNameAttr,
			parentNode,
			root,
			transition,
			transitionName,
			transitionParams,
			transitionManager,
			intro;

		this.type = ELEMENT;

		// stuff we'll need later
		parentFragment = this.parentFragment = options.parentFragment;
		descriptor = this.descriptor = options.descriptor;

		this.root = root = parentFragment.root;
		this.parentNode = parentFragment.parentNode;
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
			namespace = ( descriptor.e.toLowerCase() === 'svg' ? namespaces.svg : this.parentNode.namespaceURI );
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
					contextStack: parentFragment.contextStack,
					owner:        this
				});

				this.node.appendChild( this.fragment.docFrag );
			}
		}


		// create event proxies
		if ( descriptor.v ) {
			for ( eventName in descriptor.v ) {
				if ( descriptor.v.hasOwnProperty( eventName ) ) {
					eventNames = eventName.split( '-' );
					i = eventNames.length;

					while ( i-- ) {
						this.addEventProxy( eventNames[i], descriptor.v[ eventName ], parentFragment.contextStack );
					}
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
				if ( lcName === 'intro' || lcName === 'outro' || lcName === 'intro-params' || lcName === 'outro-params' ) {
					lcName = lcName.replace( '-params', 'Params' );

					if ( typeof	attrValue === 'string' ) {
						this[ lcName ] = attrValue;
					} else {
						this[ lcName ] = new TextFragment({
							descriptor: attrValue,
							root: root,
							owner: this,
							contextStack: parentFragment.contextStack
						});
					}
				}

				else {
					attr = new Attribute({
						element:      this,
						name:         attrName,
						value:        ( attrValue === undefined ? null : attrValue ),
						root:         root,
						parentNode:   this.node,
						contextStack: parentFragment.contextStack
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
			transitionName = this.intro.toString();
			intro = root.transitions[ transitionName ] || Ractive.transitions[ transitionName ];

			if ( intro ) {
				transitionManager = root._transitionManager;

				if ( transitionManager ) {
					transitionManager.push();
				}

				if ( this.introParams ) {
					transitionParams = this.introParams.toString();

					try {
						transitionParams = JSON.parse( transitionParams );
					} catch ( err ) {
						// nothing, just treat it as a string
					}
				}

				intro.call( root, this.node, ( transitionManager ? transitionManager.pop : noop ), transitionParams, transitionManager.info, true );
			}
		}
	};

	Element.prototype = {
		addEventProxy: function ( triggerEventName, proxyDescriptor, contextStack ) {
			var self = this, root = this.root, proxyName, proxyArgs, dynamicArgs, reuseable, definition, listener, fragment, handler, comboKey;

			// Note the current context - this can be useful with event handlers
			if ( !this.node._ractive ) {
				defineProperty( this.node, '_ractive', { value: {
					keypath: ( contextStack.length ? contextStack[ contextStack.length - 1 ] : '' )
				} });
			}

			if ( typeof proxyDescriptor === 'string' ) {
				proxyName = proxyDescriptor;
			} else {
				proxyName = proxyDescriptor.n;
			}

			// This key uniquely identifies this trigger+proxy name combo on this element
			comboKey = triggerEventName + '=' + proxyName;
			
			if ( proxyDescriptor.a ) {
				proxyArgs = proxyDescriptor.a;
			}

			else if ( proxyDescriptor.d ) {
				dynamicArgs = true;

				proxyArgs = new TextFragment({
					descriptor:   proxyDescriptor.d,
					root:         this.root,
					owner:        this,
					contextStack: contextStack
				});

				if ( !this.proxyFrags ) {
					this.proxyFrags = [];
				}
				this.proxyFrags[ this.proxyFrags.length ] = proxyArgs;
			}

			if ( proxyArgs !== undefined ) {
				// store arguments on the element, so we can reuse the same handler
				// with multiple elements
				if ( this.node._ractive[ comboKey ] ) {
					throw new Error( 'You cannot have two proxy events with the same trigger event (' + comboKey + ')' );
				}

				this.node._ractive[ comboKey ] = {
					dynamic: dynamicArgs,
					payload: proxyArgs
				};
			}

			// Is this a custom event?
			if ( definition = ( root.eventDefinitions[ triggerEventName ] || Ractive.eventDefinitions[ triggerEventName ] ) ) {
				// If the proxy is a string (e.g. <a proxy-click='select'>{{item}}</a>) then
				// we can reuse the handler. This eliminates the need for event delegation
				if ( !root._customProxies[ comboKey ] ) {
					root._customProxies[ comboKey ] = function ( proxyEvent ) {
						var args, payload;

						if ( !proxyEvent.el ) {
							throw new Error( 'Proxy event definitions must fire events with an `el` property' );
						}

						proxyEvent.keypath = proxyEvent.el._ractive.keypath;
						proxyEvent.context = root.get( proxyEvent.keypath );

						if ( proxyEvent.el._ractive[ comboKey ] ) {
							args = proxyEvent.el._ractive[ comboKey ];
							payload = args.dynamic ? args.payload.toJson() : args.payload;
						}

						root.fire( proxyName, proxyEvent, payload );
					};
				}

				handler = root._customProxies[ comboKey ];

				// Use custom event. Apply definition to this node
				listener = definition( this.node, handler );
				this.customEventListeners[ this.customEventListeners.length ] = listener;

				return;
			}

			// If not, we just need to check it is a valid event for this element
			// warn about invalid event handlers, if we're in debug mode
			if ( this.node[ 'on' + triggerEventName ] !== undefined && root.debug ) {
				if ( console && console.warn ) {
					console.warn( 'Invalid event handler (' + triggerEventName + ')' );
				}
			}

			if ( !root._proxies[ comboKey ] ) {
				root._proxies[ comboKey ] = function ( event ) {
					var args, payload, proxyEvent = {
						el: this,
						original: event,
						keypath: this._ractive.keypath,
						context: root.get( this._ractive.keypath )
					};

					if ( this._ractive && this._ractive[ comboKey ] ) {
						args = this._ractive[ comboKey ];
						payload = args.dynamic ? args.payload.toJson() : args.payload;
					}

					root.fire( proxyName, proxyEvent, payload );
				};
			}

			handler = root._proxies[ comboKey ];

			this.eventListeners[ this.eventListeners.length ] = {
				n: triggerEventName,
				h: handler
			};

			this.node.addEventListener( triggerEventName, handler );
		},

		teardown: function ( detach ) {
			var self = this, tearThisDown, transitionManager, transitionName, transitionParams, listener, outro;

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

			if ( this.proxyFrags ) {
				while ( this.proxyFrags.length ) {
					this.proxyFrags.pop().teardown();
				}
			}

			if ( this.outro ) {
				// TODO don't outro elements that have already been detached from the DOM

				transitionName = this.outro.toString();
				outro = this.root.transitions[ transitionName ] || Ractive.transitions[ transitionName ];

				if ( outro ) {
					transitionManager = this.root._transitionManager;
					
					if ( transitionManager ) {
						transitionManager.push();
					}

					if ( this.outroParams ) {
						transitionParams = this.outroParams.toString();

						try {
							transitionParams = JSON.parse( transitionParams );
						} catch ( err ) {
							// nothing, just treat it as a string
						}
					}

					outro.call( this.root, this.node, function () {
						if ( detach ) {
							self.parentNode.removeChild( self.node );
						}

						if ( transitionManager ) {
							transitionManager.pop();
						}
					}, transitionParams, transitionManager.info );
				}
			} else if ( detach ) {
				self.parentNode.removeChild( self.node );
			}
		},

		firstNode: function () {
			return this.node;
		},

		findNextNode: function ( fragment ) {
			return null;
		},

		bubble: function () {
			// noop - just so event proxy and transition fragments have something to call!
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
			var self = this, node = this.parentNode, interpolator, keypath, index, options, option, i, len;

			if ( !this.fragment ) {
				return false; // report failure
			}

			// TODO refactor this? Couldn't the interpolator have got a keypath via an expression?
			// Check this is a suitable candidate for two-way binding - i.e. it is
			// a single interpolator, which isn't an expression
			if (
				this.fragment.items.length !== 1 ||
				this.fragment.items[0].type !== INTERPOLATOR ||
				( !this.fragment.items[0].keypath && !this.fragment.items[0].ref )
			) {
				if ( this.root.debug ) {
					if ( console && console.warn ) {
						console.warn( 'Not a valid two-way data binding candidate - must be a single interpolator:', this.fragment.items );
					}
				}
				return false; // report failure
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
			this.keypath = this.interpolator.keypath || this.interpolator.descriptor.r;
			
			
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
						this.root.set( this.keypath, option.value );
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
					node.name = '{{' + this.keypath + '}}';

					this.updateViewModel = function () {
						if ( node.checked ) {
							self.root.set( self.keypath, node.value );
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
						self.root.set( self.keypath, node.checked );
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
					self.root.set( self.keypath, value );
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

		updateBindings: function () {
			// if the fragment this attribute belongs to gets reassigned (as a result of
			// as section being updated via an array shift, unshift or splice), this
			// attribute needs to recognise that its keypath has changed
			this.keypath = this.interpolator.keypath || this.interpolator.r;

			// if we encounter the special case described above, update the name attribute
			if ( this.propertyName === 'name' ) {
				// replace actual name attribute
				this.parentNode.name = '{{' + this.keypath + '}}';
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
				this.root._defAttrs[ this.root._defAttrs.length ] = this;
				this.deferred = true;
			}
		},

		update: function () {
			var value, lowerCaseName;

			if ( !this.ready ) {
				return this; // avoid items bubbling to the surface when we're still initialising
			}

			if ( this.twoway ) {
				// TODO compare against previous?

				lowerCaseName = this.lcName;
				value = this.interpolator.value;

				// special case - if we have an element like this:
				//
				//     <input type='radio' name='{{colour}}' value='red'>
				//
				// and `colour` has been set to 'red', we don't want to change the name attribute
				// to red, we want to indicate that this is the selected option, by setting
				// input.checked = true
				if ( lowerCaseName === 'name' && ( this.parentNode.type === 'checkbox' || this.parentNode.type === 'radio' ) ) {
					if ( value === this.parentNode.value ) {
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

				if ( this.lcName === 'id' ) {
					if ( this.value !== undefined ) {
						this.root.nodes[ this.value ] = undefined;
					}

					this.root.nodes[ value ] = this.parentNode;
				}

				this.parentNode.setAttribute( this.name, value );

				this.value = value;
			}

			return this;
		}
	};





	// Interpolator
	Interpolator = function ( options, docFrag ) {
		this.type = INTERPOLATOR;

		this.node = doc.createTextNode( '' );
		docFrag.appendChild( this.node );

		// extend Mustache
		initMustache( this, options );
	};

	Interpolator.prototype = {
		update: updateMustache,
		resolve: resolveMustache,

		teardown: function ( detach ) {
			teardown( this );
			
			if ( detach ) {
				this.parentNode.removeChild( this.node );
			}
		},

		render: function ( value ) {
			this.node.data = ( value === undefined ? '' : value );
		},

		firstNode: function () {
			return this.node;
		}
	};


	// Triple
	Triple = function ( options, docFrag ) {
		this.type = TRIPLE;

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

			if ( html === undefined ) {
				this.nodes = [];
				return;
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
		this.type = SECTION;

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

		smartUpdate: function ( methodName, args ) {
			var fragmentOptions, i;

			if ( methodName === 'push' || methodName === 'unshift' || methodName === 'splice' ) {
				fragmentOptions = {
					descriptor: this.descriptor.f,
					root:       this.root,
					parentNode: this.parentNode,
					owner:      this
				};

				if ( this.descriptor.i ) {
					fragmentOptions.indexRef = this.descriptor.i;
				}
			}

			if ( this[ methodName ] ) { // if not, it's sort or reverse, which doesn't affect us (i.e. our length)
				this[ methodName ]( fragmentOptions, args );
			}
		},

		pop: function () {
			// teardown last fragment
			if ( this.length ) {
				this.fragments.pop().teardown( true );
				this.length -= 1;
			}
		},

		push: function ( fragmentOptions, args ) {
			var start, end, i;

			// append list item to context stack
			start = this.length;
			end = start + args.length;

			for ( i=start; i<end; i+=1 ) {
				fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
				fragmentOptions.index = i;

				this.fragments[i] = this.createFragment( fragmentOptions );
			}
			
			this.length += args.length;

			// append docfrag in front of next node
			this.parentNode.insertBefore( this.docFrag, this.parentFragment.findNextNode( this ) );
		},

		shift: function () {
			this.splice( null, [ 0, 1 ] );
		},

		unshift: function ( fragmentOptions, args ) {
			this.splice( fragmentOptions, [ 0, 0 ].concat( new Array( args.length ) ) );
		},

		splice: function ( fragmentOptions, args ) {
			var insertionPoint, addedItems, removedItems, balance, i, start, end, spliceArgs, reassignStart, reassignEnd, reassignBy;

			if ( !args.length ) {
				return;
			}

			// figure out where the changes started...
			start = +( args[0] < 0 ? this.length + args[0] : args[0] );

			// ...and how many items were added to or removed from the array
			addedItems = Math.max( 0, args.length - 2 );
			removedItems = ( args[1] !== undefined ? args[1] : this.length - start );

			balance = addedItems - removedItems;

			if ( !balance ) {
				// The array length hasn't changed - we don't need to add or remove anything
				return;
			}

			// If more items were removed than added, we need to remove some things from the DOM
			if ( balance < 0 ) {
				end = start - balance;

				for ( i=start; i<end; i+=1 ) {
					this.fragments[i].teardown( true );
				}

				// Keep in sync
				this.fragments.splice( start, -balance );
			}

			// Otherwise we need to add some things to the DOM
			else {
				end = start + balance;

				// Figure out where these new nodes need to be inserted
				insertionPoint = ( this.fragments[ start ] ? this.fragments[ start ].firstNode() : this.parentFragment.findNextNode( this ) );

				// Make room for the new fragments. (Just trust me, this works...)
				spliceArgs = [ start, 0 ].concat( new Array( balance ) );
				this.fragments.splice.apply( this.fragments, spliceArgs );

				for ( i=start; i<end; i+=1 ) {
					fragmentOptions.contextStack = this.contextStack.concat( this.keypath + '.' + i );
					fragmentOptions.index = i;

					this.fragments[i] = this.createFragment( fragmentOptions );
				}

				// Append docfrag in front of insertion point
				this.parentNode.insertBefore( this.docFrag, insertionPoint );
			}

			this.length += balance;


			// Now we need to reassign existing fragments (e.g. items.4 -> items.3 - the keypaths,
			// context stacks and index refs will have changed)
			reassignStart = ( start + addedItems );

			reassignAffectedFragments( this.root, this, reassignStart, this.length, balance );
		},

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


	var reassignAffectedFragments = function ( root, section, start, end, by ) {
		var fragmentsToReassign, i, fragment, indexRef, oldIndex, newIndex, oldKeypath, newKeypath;

		indexRef = section.descriptor.i;

		for ( i=start; i<end; i+=1 ) {
			fragment = section.fragments[i];

			oldIndex = i - by;
			newIndex = i;

			oldKeypath = section.keypath + '.' + ( i - by );
			newKeypath = section.keypath + '.' + i;

			// change the fragment index
			fragment.index += by;

			reassignFragment( fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
		}

		processDeferredUpdates( root );
	};

	var reassignFragment = function ( fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath ) {
		var i, j, item, context;

		if ( fragment.indexRefs && fragment.indexRefs[ indexRef ] !== undefined ) {
			fragment.indexRefs[ indexRef ].index = newIndex;
		}

		// fix context stack
		i = fragment.contextStack.length;
		while ( i-- ) {
			context = fragment.contextStack[i];
			if ( context.substr( 0, oldKeypath.length ) === oldKeypath ) {
				fragment.contextStack[i] = context.replace( oldKeypath, newKeypath );
			}
		}

		i = fragment.items.length;
		while ( i-- ) {
			item = fragment.items[i];

			switch ( item.type ) {
				case ELEMENT:
				reassignElement( item, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
				break;

				case PARTIAL:
				reassignFragment( item.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
				break;

				case SECTION:
				case INTERPOLATOR:
				case TRIPLE:
				reassignMustache( item, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
				break;
			}
		}
	};

	var reassignElement = function ( element, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath ) {
		var i, attribute;

		i = element.attributes.length;
		while ( i-- ) {
			attribute = element.attributes[i];

			if ( attribute.fragment ) {
				reassignFragment( attribute.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );

				if ( attribute.twoway ) {
					attribute.updateBindings();
				}
			}
		}

		// reassign proxy argument fragments TODO and intro/outro param fragments
		if ( element.proxyFrags ) {
			i = element.proxyFrags.length;
			while ( i-- ) {
				reassignFragment( element.proxyFrags[i], indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
			}
		}

		if ( element.node._ractive ) {
			if ( element.node._ractive.keypath ) {
				if ( element.node._ractive.keypath.substr( 0, oldKeypath.length ) === oldKeypath ) {
					element.node._ractive.keypath = element.node._ractive.keypath.replace( oldKeypath, newKeypath );
				}
			}
		}

		// reassign children
		if ( element.fragment ) {
			reassignFragment( element.fragment, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
		}
	};

	var reassignMustache = function ( mustache, indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath ) {
		var i;

		// expression mustache?
		if ( mustache.descriptor.x ) {
			if ( mustache.keypath ) {
				unregisterDependant( mustache );
			}
			
			if ( mustache.expressionResolver ) {
				mustache.expressionResolver.teardown();
			}

			mustache.expressionResolver = new ExpressionResolver( mustache );
		}

		// normal keypath mustache?
		if ( mustache.keypath ) {
			if ( mustache.keypath.substr( 0, oldKeypath.length ) === oldKeypath ) {
				unregisterDependant( mustache );

				mustache.keypath = mustache.keypath.replace( oldKeypath, newKeypath );
				registerDependant( mustache );
			}
		}

		// index ref mustache?
		else if ( mustache.refIndex ) {
			mustache.refIndex = newIndex;
			mustache.render( newIndex );
		}

		// otherwise, it's an unresolved reference. the context stack has been updated
		// so it will take care of itself

		// if it's a section mustache, we need to go through any children
		if ( mustache.fragments ) {
			i = mustache.fragments.length;
			while ( i-- ) {
				reassignFragment( mustache.fragments[i], indexRef, oldIndex, newIndex, by, oldKeypath, newKeypath );
			}
		}
	};

}());
