// Element
DomElement = function ( options, docFrag ) {

	var parentFragment,
		descriptor,
		namespace,
		attributes,
		root;

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
		namespace = getElementNamespace( descriptor, this.parentNode );

		// create the DOM node
		this.node = doc.createElementNS( namespace, descriptor.e );
	}


	// append children, if there are any
	if ( descriptor.f ) {
		appendElementChildren( this, this.node, descriptor, docFrag );
	}


	// create event proxies
	if ( docFrag && descriptor.v ) {
		addEventProxies( this, descriptor.v );
	}

	// set attributes
	attributes = createElementAttributes( this, descriptor.a );


	// if we're actually rendering (i.e. not server-side stringifying), proceed
	if ( docFrag ) {
		// deal with two-way bindings
		if ( root.twoway ) {
			bindElement( this, attributes );
		}

		// name attributes are deferred, because they're a special case
		if ( attributes.name ) {
			attributes.name.update();
		}

		docFrag.appendChild( this.node );

		// trigger intro transition
		if ( descriptor.t1 ) {
			executeTransition( descriptor.t1, root, this, parentFragment.contextStack, true );
		}
	}
};

DomElement.prototype = {
	teardown: function ( detach ) {
		var eventName;

		// Children first. that way, any transitions on child elements will be
		// handled by the current transitionManager
		if ( this.fragment ) {
			this.fragment.teardown( false );
		}

		while ( this.attributes.length ) {
			this.attributes.pop().teardown();
		}

		if ( this.node._ractive ) {
			for ( eventName in this.node._ractive.events ) {
				this.node._ractive.events[ eventName ].teardown();
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

	findNextNode: function () {
		return null;
	},

	// TODO can we get rid of this?
	bubble: noop, // just so event proxy and transition fragments have something to call!

	toString: function () {
		var str, i, len;

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
	},

	ractify: function () {
		var contextStack = this.parentFragment.contextStack;

		if ( !this.node._ractive ) {
			defineProperty( this.node, '_ractive', {
				value: {
					keypath: ( contextStack.length ? contextStack[ contextStack.length - 1 ] : '' ),
					index: this.parentFragment.indexRefs,
					events: createFromNull(),
					root: this.root
				}
			});
		}

		return this.node._ractive;
	}
};