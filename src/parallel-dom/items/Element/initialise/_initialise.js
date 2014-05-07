import runloop from 'global/runloop';
import types from 'config/types';
import namespaces from 'config/namespaces';
import create from 'utils/create';
import defineProperty from 'utils/defineProperty';
import warn from 'utils/warn';
import createElement from 'utils/createElement';
import getInnerContext from 'shared/getInnerContext';
import getElementNamespace from 'parallel-dom/items/Element/initialise/getElementNamespace';
import createElementAttribute from 'parallel-dom/items/Element/initialise/createElementAttribute';
import createElementAttributes from 'parallel-dom/items/Element/initialise/createElementAttributes';
import appendElementChildren from 'parallel-dom/items/Element/initialise/appendElementChildren';
import decorate from 'parallel-dom/items/Element/initialise/decorate/_decorate';
import addEventProxies from 'parallel-dom/items/Element/initialise/addEventProxies/_addEventProxies';
import updateLiveQueries from 'parallel-dom/items/Element/initialise/updateLiveQueries';
import executeTransition from 'parallel-dom/items/Element/shared/executeTransition/_executeTransition';
import enforceCase from 'parallel-dom/items/Element/shared/enforceCase';

export default function initialiseElement ( element, options, docFrag ) {
	var parentFragment,
		pNode,
		template,
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
	template = element.template = options.template;

	element.parent = options.pElement || parentFragment.pElement;

	element.root = root = parentFragment.root;
	element.index = options.index;
	element.lcName = template.e.toLowerCase();

	element.eventListeners = [];
	element.customEventListeners = [];

	element.cssDetachQueue = [];


	// If this is an option element, we need to store a reference to its select
	if ( element.lcName === 'option' ) {
		element.select = findParentSelect( element.parent );
	}

	element.namespace = getElementNamespace( template, element.parent );
	element.name = ( namespace !== namespaces.html ? enforceCase( template.e ) : template.e );


	// set attributes
	attributes = createElementAttributes( element, template.a );


	// append children, if there are any
	if ( template.f ) {
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

		appendElementChildren( element, element.node, template, docFrag );
	}


	// create event proxies
	if ( docFrag && template.v ) {
		addEventProxies( element, template.v );
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
		if ( template.o ) {
			decorate( template.o, root, element );
		}

		// trigger intro transition
		if ( template.t0 || template.t1 ) {
			executeTransition( template.t0 || template.t1, root, element, true );
		}

		if ( element.node.tagName === 'OPTION' ) {
			// Special case... if this option's parent select was previously
			// empty, it's possible that it should initialise to the value of
			// this option.
			if ( pNode.tagName === 'SELECT' && ( selectBinding = pNode._ractive.binding ) ) { // it should be!
				selectBinding.deferUpdate();
			}

			// If a value attribute was not given, we need to create one based on
			// the content of the node, so that `<option>foo</option>` behaves the
			// same as `<option value='foo'>foo</option>` with two-way binding
			if ( !attributes.value ) {
				createElementAttribute( element, 'value', template.f );
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


	updateLiveQueries( element );
}

function findParentSelect ( element ) {
	do {
		if ( element.lcName === 'select' ) {
			return element;
		}
	} while ( element = element.parent );
}
