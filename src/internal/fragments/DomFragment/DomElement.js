// Element
DomElement = function ( options, docFrag ) {

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

	// get namespace, if we're actually rendering (not server-side stringifying)
	if ( this.parentNode ) {
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
	}


	// append children, if there are any
	if ( descriptor.f ) {
		if ( typeof descriptor.f === 'string' && ( !this.node || ( !this.node.namespaceURI || this.node.namespaceURI === namespaces.html ) ) ) {
			// great! we can use innerHTML
			this.html = descriptor.f;

			if ( docFrag ) {
				this.node.innerHTML = this.html;
			}
		}

		else {
			// once again, everyone has to suffer because of IE bloody 8
			if ( descriptor.e === 'style' && this.node.styleSheet !== undefined ) {
				this.fragment = new StringFragment({
					descriptor:   descriptor.f,
					root:         root,
					contextStack: parentFragment.contextStack,
					owner:        this
				});

				if ( docFrag ) {
					this.bubble = function () {
						this.node.styleSheet.cssText = this.fragment.toString();
					};
				}
			}

			else {
				this.fragment = new DomFragment({
					descriptor:   descriptor.f,
					root:         root,
					parentNode:   this.node,
					contextStack: parentFragment.contextStack,
					owner:        this
				});

				if ( docFrag ) {
					this.node.appendChild( this.fragment.docFrag );
				}
			}
		}
	}


	// create event proxies
	if ( docFrag && descriptor.v ) {
		for ( eventName in descriptor.v ) {
			if ( hasOwn.call( descriptor.v, eventName ) ) {
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
		if ( hasOwn.call( descriptor.a, attrName ) ) {
			attrValue = descriptor.a[ attrName ];
			
			attr = new DomAttribute({
				element:      this,
				name:         attrName,
				value:        ( attrValue === undefined ? null : attrValue ),
				root:         root,
				parentNode:   this.node,
				contextStack: parentFragment.contextStack
			});

			this.attributes[ this.attributes.length ] = attr;

			// TODO why is this an array? Shurely an element can only have one two-way attribute?
			if ( attr.isBindable ) {
				bindable.push( attr );
			}

			// The name attribute is a special case - it is the only two-way attribute that updates
			// the viewmodel based on the value of another attribute. For that reason it must wait
			// until the node has been initialised, and the viewmodel has had its first two-way
			// update, before updating itself (otherwise it may disable a checkbox or radio that
			// was enabled in the template)
			if ( attr.isBindable && attr.propertyName === 'name' ) {
				twowayNameAttr = attr;
			} else {
				attr.update();
			}
		}
	}

	// if we're actually rendering (i.e. not server-side stringifying), proceed
	if ( docFrag ) {
		while ( bindable.length ) {
			bindable.pop().bind( this.root.lazy );
		}

		if ( twowayNameAttr ) {
			if ( twowayNameAttr.updateViewModel ) {
				twowayNameAttr.updateViewModel();
			}
			twowayNameAttr.update();
		}

		docFrag.appendChild( this.node );

		// trigger intro transition
		if ( descriptor.t1 ) {
			executeTransition( descriptor.t1, root, this, parentFragment.contextStack, true );
		}
	}
};

DomElement.prototype = {
	addEventProxy: function ( triggerEventName, proxyDescriptor, contextStack ) {
		var self = this, root = this.root, proxyName, proxyArgs, dynamicArgs, reuseable, definition, listener, fragment, handler, comboKey;

		// Note the current context - this can be useful with event handlers
		if ( !this.node._ractive ) {
			defineProperty( this.node, '_ractive', { value: {
				keypath: ( contextStack.length ? contextStack[ contextStack.length - 1 ] : '' ),
				index: this.parentFragment.indexRefs
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

			proxyArgs = new StringFragment({
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

					if ( !proxyEvent.node ) {
						throw new Error( 'Proxy event definitions must fire events with a `node` property' );
					}

					proxyEvent.keypath = proxyEvent.node._ractive.keypath;
					proxyEvent.context = root.get( proxyEvent.keypath );
					proxyEvent.index = proxyEvent.node._ractive.index;

					if ( proxyEvent.node._ractive[ comboKey ] ) {
						args = proxyEvent.node._ractive[ comboKey ];
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
					node: this,
					original: event,
					keypath: this._ractive.keypath,
					context: root.get( this._ractive.keypath ),
					index: this._ractive.index
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

		this.node.addEventListener( triggerEventName, handler, false );
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
			self.node.removeEventListener( listener.n, listener.h, false );
		}

		while ( self.customEventListeners.length ) {
			self.customEventListeners.pop().teardown();
		}

		if ( this.proxyFrags ) {
			while ( this.proxyFrags.length ) {
				this.proxyFrags.pop().teardown();
			}
		}

		if ( this.descriptor.t2 ) {
			executeTransition( this.descriptor.t2, this.root, this, this.parentFragment.contextStack, false );
		}

		if ( detach ) {
			this.root._transitionManager.detachWhenReady( this.node );
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
	},

	toString: function () {
		var str, i, len, attr;

		// TODO void tags
		str = '' +
			'<' + this.descriptor.e;

		len = this.attributes.length;
		for ( i=0; i<len; i+=1 ) {
			str += ' ' + this.attributes[i].toString();
		}

		str += '>';

		if ( this.html ) {
			str += this.html;
		} else if ( this.fragment ) {
			str += this.fragment.toString();
		}

		str += '</' + this.descriptor.e + '>';

		return str;
	}
};