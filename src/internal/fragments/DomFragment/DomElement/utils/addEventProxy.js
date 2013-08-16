addEventProxy = function ( element, triggerEventName, proxyDescriptor, contextStack ) {
	var root = element.root, proxyName, proxyArgs, dynamicArgs, definition, listener, handler, comboKey;

	element.ractify();

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
			root:         element.root,
			owner:        element,
			contextStack: contextStack
		});

		if ( !element.proxyFrags ) {
			element.proxyFrags = [];
		}
		element.proxyFrags[ element.proxyFrags.length ] = proxyArgs;
	}

	if ( proxyArgs !== undefined ) {
		// store arguments on the element, so we can reuse the same handler
		// with multiple elements
		if ( element.node._ractive[ comboKey ] ) {
			throw new Error( 'You cannot have two proxy events with the same trigger event (' + comboKey + ')' );
		}

		element.node._ractive[ comboKey ] = {
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
					payload = args.dynamic ? args.payload.toJSON() : args.payload;
				}

				root.fire( proxyName, proxyEvent, payload );
			};
		}

		handler = root._customProxies[ comboKey ];

		// Use custom event. Apply definition to this node
		listener = definition( element.node, handler );
		element.customEventListeners[ element.customEventListeners.length ] = listener;

		return;
	}

	// If not, we just need to check it is a valid event for this element
	// warn about invalid event handlers, if we're in debug mode
	if ( element.node[ 'on' + triggerEventName ] !== undefined && root.debug ) {
		if ( console && console.warn ) {
			console.warn( 'Invalid event handler (' + triggerEventName + ')' );
		}
	}

	if ( !root._proxies[ comboKey ] ) {
		root._proxies[ comboKey ] = function ( event ) {
			var args, payload, proxyEvent = {
				node: element,
				original: event,
				keypath: element.node._ractive.keypath,
				context: root.get( element.node._ractive.keypath ),
				index: element.node._ractive.index
			};

			if ( element.node._ractive && element.node._ractive[ comboKey ] ) {
				args = element.node._ractive[ comboKey ];
				payload = args.dynamic ? args.payload.toJSON() : args.payload;
			}

			root.fire( proxyName, proxyEvent, payload );
		};
	}

	handler = root._proxies[ comboKey ];

	element.eventListeners[ element.eventListeners.length ] = {
		n: triggerEventName,
		h: handler
	};

	element.node.addEventListener( triggerEventName, handler, false );
};