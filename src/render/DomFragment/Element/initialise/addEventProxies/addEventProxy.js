define([ 'utils/warn', 'render/StringFragment/_StringFragment' ], function ( warn, StringFragment ) {

	'use strict';

	var addEventProxy,

		// helpers
		MasterEventHandler,
		ProxyEvent,
		firePlainEvent,
		fireEventWithArgs,
		fireEventWithDynamicArgs,
		customHandlers,
		genericHandler,
		getCustomHandler;

	addEventProxy = function ( element, triggerEventName, proxyDescriptor, indexRefs ) {
		var events, master;

		events = element.node._ractive.events;
		master = events[ triggerEventName ] || ( events[ triggerEventName ] = new MasterEventHandler( element, triggerEventName, indexRefs ) );

		master.add( proxyDescriptor );
	};

	MasterEventHandler = function ( element, eventName ) {
		var definition;

		this.element = element;
		this.root = element.root;
		this.node = element.node;
		this.name = eventName;
		this.proxies = [];

		if ( definition = this.root.events[ eventName ] ) {
			this.custom = definition( this.node, getCustomHandler( eventName ) );
		} else {
			// Looks like we're dealing with a standard DOM event... but let's check
			if ( !( 'on' + eventName in this.node ) ) {
				warn( 'Missing "' + this.name + '" event. You may need to download a plugin via http://docs.ractivejs.org/latest/plugins#events' );
			}

			this.node.addEventListener( eventName, genericHandler, false );
		}
	};

	MasterEventHandler.prototype = {
		add: function ( proxy ) {
			this.proxies.push( new ProxyEvent( this.element, this.root, proxy ) );
		},

		// TODO teardown when element torn down
		teardown: function () {
			var i;

			if ( this.custom ) {
				this.custom.teardown();
			} else {
				this.node.removeEventListener( this.name, genericHandler, false );
			}

			i = this.proxies.length;
			while ( i-- ) {
				this.proxies[i].teardown();
			}
		},

		fire: function ( event ) {
			var i = this.proxies.length;

			while ( i-- ) {
				this.proxies[i].fire( event );
			}
		}
	};

	ProxyEvent = function ( element, ractive, descriptor ) {
		var name;

		this.root = ractive;

		name = descriptor.n || descriptor;

		if ( typeof name === 'string' ) {
			this.n = name;
		} else {
			this.n = new StringFragment({
				descriptor:   descriptor.n,
				root:         this.root,
				owner:        element
			});
		}

		if ( descriptor.a ) {
			this.a = descriptor.a;
			this.fire = fireEventWithArgs;
			return;
		}

		if ( descriptor.d ) {
			this.d = new StringFragment({
				descriptor:   descriptor.d,
				root:         this.root,
				owner:        element
			});
			this.fire = fireEventWithDynamicArgs;
			return;
		}

		this.fire = firePlainEvent;
	};

	ProxyEvent.prototype = {
		teardown: function () {
			if ( this.n.teardown) {
				this.n.teardown();
			}

			if ( this.d ) {
				this.d.teardown();
			}
		},

		bubble: function () {} // TODO can we get rid of this?
	};

	// the ProxyEvent instance fire method could be any of these
	firePlainEvent = function ( event ) {
		this.root.fire( this.n.toString(), event );
	};

	fireEventWithArgs = function ( event ) {
		this.root.fire.apply( this.root, [ this.n.toString(), event ].concat( this.a ) );
	};

	fireEventWithDynamicArgs = function ( event ) {
		var args = this.d.toArgsList();

		// need to strip [] from ends if a string!
		if ( typeof args === 'string' ) {
			args = args.substr( 1, args.length - 2 );
		}

		this.root.fire.apply( this.root, [ this.n.toString(), event ].concat( args ) );
	};

	// all native DOM events dealt with by Ractive share a single handler
	genericHandler = function ( event ) {
		var storage = this._ractive;

		storage.events[ event.type ].fire({
			node: this,
			original: event,
			index: storage.index,
			keypath: storage.keypath,
			context: storage.root.get( storage.keypath )
		});
	};

	customHandlers = {};

	getCustomHandler = function ( eventName ) {
		if ( customHandlers[ eventName ] ) {
			return customHandlers[ eventName ];
		}

		return customHandlers[ eventName ] = function ( event ) {
			var storage = event.node._ractive;

			event.index = storage.index;
			event.keypath = storage.keypath;
			event.context = storage.root.get( storage.keypath );

			storage.events[ eventName ].fire( event );
		};
	};

	return addEventProxy;

});
