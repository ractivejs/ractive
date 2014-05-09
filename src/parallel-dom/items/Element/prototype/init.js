import types from 'config/types';
import namespaces from 'config/namespaces';
import enforceCase from 'parallel-dom/items/Element/shared/enforceCase';
import getElementNamespace from 'parallel-dom/items/Element/prototype/init/getElementNamespace';
import createAttributes from 'parallel-dom/items/Element/prototype/init/createAttributes';
import createChildren from 'parallel-dom/items/Element/prototype/init/createChildren';
import createEventHandlers from 'parallel-dom/items/Element/prototype/init/createEventHandlers';
import Decorator from 'parallel-dom/items/Element/Decorator/_Decorator';
import Transition from 'parallel-dom/items/Element/Transition/_Transition';

import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function Element$init ( options ) {
	var parentFragment,
		pNode,
		template,
		namespace,
		name,
		attributes,
		width,
		height,
		loadHandler,
		ractive,
		selectBinding,
		errorMessage;

	this.type = types.ELEMENT;

	// stuff we'll need later
	parentFragment = this.parentFragment = options.parentFragment;
	template = this.template = options.template;

	this.parent = options.pElement || parentFragment.pElement;

	this.root = ractive = parentFragment.root;
	this.index = options.index;

	this.eventListeners = [];
	this.customEventListeners = [];

	this.cssDetachQueue = [];


	this.namespace = getElementNamespace( template, this.parent );
	this.name = ( namespace !== namespaces.html ? enforceCase( template.e ) : template.e );


	// Special case - <option> elements
	if ( this.name === 'option' ) {
		this.select = findParentSelect( this.parent );

		// If the value attribute is missing, use the element's content
		if ( !template.a ) {
			template.a = {};
		}
		template.a.value = template.f;
	}

	// create attributes
	this.attributes = createAttributes( this, template.a );

	// Special case - <option> elements
	if ( this.name === 'option' ) {
		if ( this.select.initialValue === undefined || ( this.getAttribute( 'selected' ) ) ) {
			this.select.initialValue = this.getAttribute( 'value' );
		}
	}


	// append children, if there are any
	if ( template.f ) {
		// Special case - contenteditable
		/*if ( this.node && this.node.getAttribute( 'contenteditable' ) ) {
			if ( this.node.innerHTML ) {
				// This is illegal. You can't have content inside a contenteditable
				// element that's already populated
				errorMessage = 'A pre-populated contenteditable element should not have children';
				if ( root.debug ) {
					throw new Error( errorMessage );
				} else {
					warn( errorMessage );
				}
			}
		}*/

		this.fragment = new Fragment({
			template: template.f,
			root:     ractive,
			owner:    this,
			pElement: this,
		});

		// Special case - <select>
		if ( this.name === 'select' ) {
			console.warn( 'TODO - set two-way bound select value based on options' );
			console.log( this.initialValue );
		}
	}


	// create event proxies
	if ( template.v ) {
		this.eventHandlers = createEventHandlers( this, template.v );
	}

	// create decorator
	if ( template.o ) {
		this.decorator = new Decorator( this, template.o );
	}

	// create transitions
	if ( template.t0 ) {
		this.intro = this.outro = new Transition( this, template.t0 );
	}

	if ( template.t1 ) {
		this.intro = new Transition ( this, template.t1 );
	}

	if ( template.t2 ) {
		this.outro = new Transition ( this, template.t2 );
	}

	// if we're actually rendering (i.e. not server-side stringifying), proceed
	/*if ( docFrag ) {
		// deal with two-way bindings
		if ( root.twoway ) {
			this.bind();

			// Special case - contenteditable
			if ( this.node.getAttribute( 'contenteditable' ) && this.node._ractive.binding ) {
				// We need to update the model
				this.node._ractive.binding.update();
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
		if ( this.node.tagName === 'IMG' && ( ( width = this.attributes.width ) || ( height = this.attributes.height ) ) ) {
			this.node.addEventListener( 'load', loadHandler = function () {
				if ( width ) {
					this.node.width = width.value;
				}

				if ( height ) {
					this.node.height = height.value;
				}

				this.node.removeEventListener( 'load', loadHandler, false );
			}, false );
		}

		docFrag.appendChild( this.node );

		// apply decorator(s)
		if ( template.o ) {
			decorate( template.o, root, this );
		}

		// trigger intro transition
		if ( template.t0 || template.t1 ) {
			executeTransition( template.t0 || template.t1, root, this, true );
		}

		if ( this.node.tagName === 'OPTION' ) {
			// Special case... if this option's parent select was previously
			// empty, it's possible that it should initialise to the value of
			// this option.
			if ( pNode.tagName === 'SELECT' && ( selectBinding = pNode._ractive.binding ) ) { // it should be!
				selectBinding.deferUpdate();
			}

			// Special case... a select may have had its value set before a matching
			// option was rendered. This might be that option element
			if ( this.node._ractive.value == pNode._ractive.value ) {
				this.node.selected = true;
			}
		}

		if ( this.node.autofocus ) {
			// Special case. Some browsers (*cough* Firefix *cough*) have a problem
			// with dynamically-generated elements having autofocus, and they won't
			// allow you to programmatically focus the element until it's in the DOM
			runloop.focus( this.node );
		}

		updateLiveQueries( this );
	}*/
}


function findParentSelect ( element ) {
	do {
		if ( element.name === 'select' ) {
			return element;
		}
	} while ( element = element.parent );
}
