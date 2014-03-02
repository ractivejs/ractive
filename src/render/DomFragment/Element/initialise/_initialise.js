define([
	'global/runloop',
	'config/types',
	'config/namespaces',
	'utils/create',
	'utils/defineProperty',
	'utils/warn',
	'utils/createElement',
	'shared/getInnerContext',
	'render/DomFragment/Element/initialise/getElementNamespace',
	'render/DomFragment/Element/initialise/createElementAttributes',
	'render/DomFragment/Element/initialise/appendElementChildren',
	'render/DomFragment/Element/initialise/decorate/_decorate',
	'render/DomFragment/Element/initialise/addEventProxies/_addEventProxies',
	'render/DomFragment/Element/initialise/updateLiveQueries',
	'render/DomFragment/Element/shared/executeTransition/_executeTransition',
	'render/DomFragment/shared/enforceCase'
], function (
	runloop,
	types,
	namespaces,
	create,
	defineProperty,
	warn,
	createElement,
	getInnerContext,
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

	return function initialiseElement ( element, options, docFrag ) {
		var parentFragment,
			pNode,
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
		pNode = parentFragment.pNode;
		descriptor = element.descriptor = options.descriptor;

		element.parent = options.pElement;

		element.root = root = parentFragment.root;
		element.index = options.index;
		element.lcName = descriptor.e.toLowerCase();

		element.eventListeners = [];
		element.customEventListeners = [];

		element.cssDetachQueue = [];

		// get namespace, if we're actually rendering (not server-side stringifying)
		if ( pNode ) {
			namespace = element.namespace = getElementNamespace( descriptor, pNode );

			// non-HTML elements (i.e. SVG) are case-sensitive
			name = ( namespace !== namespaces.html ? enforceCase( descriptor.e ) : descriptor.e );

			// create the DOM node
			element.node = createElement( name, namespace );

			// Is this a top-level node of a component? If so, we may need to add
			// a data-rvcguid attribute, for CSS encapsulation
			if ( root.css && pNode === root.el ) {
				element.node.setAttribute( 'data-rvcguid', root.constructor._guid || root._guid );
			}


			// Add _ractive property to the node - we use this object to store stuff
			// related to proxy events, two-way bindings etc
			defineProperty( element.node, '_ractive', {
				value: {
					proxy: element,
					keypath: getInnerContext( parentFragment ),
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
				decorate( descriptor.o, root, element );
			}

			// trigger intro transition
			if ( descriptor.t1 ) {
				executeTransition( descriptor.t1, root, element, true );
			}

			if ( element.node.tagName === 'OPTION' ) {
				// Special case... if this option's parent select was previously
				// empty, it's possible that it should initialise to the value of
				// this option.
				if ( pNode.tagName === 'SELECT' && ( selectBinding = pNode._ractive.binding ) ) { // it should be!
					selectBinding.deferUpdate();
				}

				// Special case... a select may have had its value set before a matching
				// option was rendered. This might be that option element
				if ( element.node._ractive.value == pNode._ractive.value ) {
					element.node.selected = true;
				}
			}

			if ( element.node.autofocus ) {
				// Special case. Some browsers (*cough* Firefix *cough*) have a problem
				// with dynamically-generated elements having autofocus, and they won't
				// allow you to programmatically focus the element until it's in the DOM
				runloop.focus( element.node );
			}
		}

		// If this is an option element, we need to store a reference to its select
		if ( element.lcName === 'option' ) {
			element.select = findParentSelect( element.parent );
		}

		updateLiveQueries( element );
	};


	function findParentSelect ( element ) {
		do {
			if ( element.lcName === 'select' ) {
				return element;
			}
		} while ( element = element.parent );
	}

});
