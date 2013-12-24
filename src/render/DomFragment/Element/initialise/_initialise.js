define([
	'config/types',
	'config/namespaces',
	'utils/create',
	'utils/defineProperty',
	'utils/matches',
	'utils/warn',
	'render/DomFragment/Element/initialise/getElementNamespace',
	'render/DomFragment/Element/initialise/createElementAttributes',
	'render/DomFragment/Element/initialise/appendElementChildren',
	'render/DomFragment/Element/initialise/decorate/_decorate',
	'render/DomFragment/Element/initialise/addEventProxies/_addEventProxies',
	'render/DomFragment/Element/initialise/updateLiveQueries',
	'render/DomFragment/Element/shared/executeTransition/_executeTransition',
	'render/DomFragment/shared/enforceCase'
], function (
	types,
	namespaces,
	create,
	defineProperty,
	matches,
	warn,
	getElementNamespace,
	createElementAttributes,
	appendElementChildren,
	decorate,
	addEventProxies,
	updateLiveQueries,
	executeTransition,
	enforceCase
) {

	'use strict';

	return function ( element, options, docFrag ) {
		var parentFragment,
			contextStack,
			descriptor,
			namespace,
			name,
			attributes,
			width,
			height,
			loadHandler,
			root,
			selectBinding,
			errorMessage;

		element.type = types.ELEMENT;

		// stuff we'll need later
		parentFragment = element.parentFragment = options.parentFragment;
		contextStack = parentFragment.contextStack;
		descriptor = element.descriptor = options.descriptor;

		element.root = root = parentFragment.root;
		element.pNode = parentFragment.pNode;
		element.index = options.index;
		element.lcName = descriptor.e.toLowerCase();

		element.eventListeners = [];
		element.customEventListeners = [];

		// get namespace, if we're actually rendering (not server-side stringifying)
		if ( element.pNode ) {
			namespace = element.namespace = getElementNamespace( descriptor, element.pNode );

			// non-HTML elements (i.e. SVG) are case-sensitive
			name = ( namespace !== namespaces.html ? enforceCase( descriptor.e ) : descriptor.e );

			// create the DOM node
			element.node = document.createElementNS( namespace, name );

			// Add _ractive property to the node - we use this object to store stuff
			// related to proxy events, two-way bindings etc
			defineProperty( element.node, '_ractive', {
				value: {
					keypath: ( contextStack.length ? contextStack[ contextStack.length - 1 ] : '' ),
					index: parentFragment.indexRefs,
					events: create( null ),
					root: root
				}
			});
		}


		// set attributes
		attributes = createElementAttributes( element, descriptor.a );


		// append children, if there are any
		if ( descriptor.f ) {
			// Special case - contenteditable
			if ( element.node && element.node.getAttribute( 'contenteditable' ) ) {
				if ( element.node.innerHTML ) {
					// This is illegal. You can't have content inside a contenteditable
					// element that's already populated
					errorMessage = 'A pre-populated contenteditable element should not have children';
					if ( root.debug ) {
						throw new Error( errorMessage );
					} else {
						warn( errorMessage );
					}
				}
			}

			appendElementChildren( element, element.node, descriptor, docFrag );
		}


		// create event proxies
		if ( docFrag && descriptor.v ) {
			addEventProxies( element, descriptor.v );
		}

		// if we're actually rendering (i.e. not server-side stringifying), proceed
		if ( docFrag ) {
			// deal with two-way bindings
			if ( root.twoway ) {
				element.bind();

				// Special case - contenteditable
				if ( element.node.getAttribute( 'contenteditable' ) && element.node._ractive.binding ) {
					// We need to update the model
					element.node._ractive.binding.update();
				}
			}

			// name attributes are deferred, because they're a special case - if two-way
			// binding is involved they need to update later. But if it turns out they're
			// not two-way we can update them now
			if ( attributes.name && !attributes.name.twoway ) {
				attributes.name.update();
			}

			// if this is an <img>, and we're in a crap browser, we may need to prevent it
			// from overriding width and height when it loads the src
			if ( element.node.tagName === 'IMG' && ( ( width = element.attributes.width ) || ( height = element.attributes.height ) ) ) {
				element.node.addEventListener( 'load', loadHandler = function () {
					if ( width ) {
						element.node.width = width.value;
					}

					if ( height ) {
						element.node.height = height.value;
					}

					element.node.removeEventListener( 'load', loadHandler, false );
				}, false );
			}

			docFrag.appendChild( element.node );

			// apply decorator(s)
			if ( descriptor.o ) {
				decorate( descriptor.o, root, element, contextStack );
			}

			// trigger intro transition
			if ( descriptor.t1 ) {
				executeTransition( descriptor.t1, root, element, contextStack, true );
			}

			if ( element.node.tagName === 'OPTION' ) {
				// Special case... if this option's parent select was previously
				// empty, it's possible that it should initialise to the value of
				// this option.
				if ( element.pNode.tagName === 'SELECT' && ( selectBinding = element.pNode._ractive.binding ) ) { // it should be!
					selectBinding.deferUpdate();
				}

				// Special case... a select may have had its value set before a matching
				// option was rendered. This might be that option element
				if ( element.node._ractive.value == element.pNode._ractive.value ) {
					element.node.selected = true;
				}
			}

			if ( element.node.autofocus ) {
				// Special case. Some browsers (*cough* Firefix *cough*) have a problem
				// with dynamically-generated elements having autofocus, and they won't
				// allow you to programmatically focus the element until it's in the DOM
				root._deferred.focusable = element.node;
			}
		}

		updateLiveQueries( element );
	};

});