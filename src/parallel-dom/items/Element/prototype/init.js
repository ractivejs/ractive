import types from 'config/types';
import namespaces from 'config/namespaces';
import runloop from 'global/runloop';
import toArray from 'utils/toArray';
import set from 'shared/set';
import enforceCase from 'parallel-dom/items/Element/shared/enforceCase';
import getElementNamespace from 'parallel-dom/items/Element/prototype/init/getElementNamespace';
import createAttributes from 'parallel-dom/items/Element/prototype/init/createAttributes';
import createTwowayBinding from 'parallel-dom/items/Element/prototype/init/createTwowayBinding';
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
		template,
		namespace,
		// width,
		// height,
		// loadHandler,
		ractive,
		binding,
		bindings;

	this.type = types.ELEMENT;

	// stuff we'll need later
	parentFragment = this.parentFragment = options.parentFragment;
	template = this.template = options.template;

	this.parent = options.pElement || parentFragment.pElement;

	this.root = ractive = parentFragment.root;
	this.index = options.index;

	this.cssDetachQueue = [];


	this.namespace = getElementNamespace( template, this.parent );
	this.name = ( namespace !== namespaces.html ? enforceCase( template.e ) : template.e );


	// Special case - <option> elements
	if ( this.name === 'option' ) {
		this.select = findParentSelect( this.parent );
		this.select.options.push( this );

		// If the value attribute is missing, use the element's content
		if ( !template.a ) {
			template.a = {};
		}

		if ( !template.a.value ) {
			template.a.value = template.f;
		}

		// If there is a `selected` attribute, but the <select>
		// already has a value, delete it
		if ( 'selected' in template.a && this.select.getAttribute( 'value' ) !== undefined ) {
			delete template.a.selected;
		}
	}

	// create attributes
	this.attributes = createAttributes( this, template.a );

	// create twoway binding
	if ( ractive.twoway && ( binding = createTwowayBinding( this, template.a ) ) ) {
		this.binding = binding;

		// register this with the root, so that we can do ractive.updateModel()
		bindings = this.root._twowayBindings[ binding.keypath ] || ( this.root._twowayBindings[ binding.keypath ] = [] );
		bindings.push( binding );
	}


	// Special case - <option> elements
	if ( this.name === 'option' ) {
		if ( this.select.binding ) {
			this.select.binding.dirty();

			if ( this.select.getAttribute( 'multiple' ) ) {
				if ( this.getAttribute( 'selected' ) ) {
					if ( !this.select.binding.initialValue ) {
						this.select.binding.initialValue = [];
					}

					this.select.binding.initialValue.push( this.getAttribute( 'value' ) );
				}
			}

			else if ( this.getAttribute( 'selected' ) || this.select.binding.initialValue === undefined ) {
				this.select.binding.initialValue = this.getAttribute( 'value' );
			}
		}
	}

	// Special case - <select> elements
	if ( this.name === 'select' ) {
		this.options = [];

		if ( this.getAttribute( 'multiple' ) && this.binding ) {
			// As <option> elements are created, they will populate this array
			this.binding.initialValue = [];
		}

		this.bubble = function () {
			if ( !this.dirty ) {
				this.dirty = true;
				runloop.modelUpdate( this );
			}
		};

		this.update = function () {
			syncSelect( this );
		};
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

function syncSelect ( selectElement ) {
	var selectNode, selectValue, isMultiple, options, value, i, optionWasSelected;

	selectNode = selectElement.node;

	if ( !selectNode ) {
		return;
	}

	options = toArray( selectNode.options );

	selectValue = selectElement.getAttribute( 'value' );
	isMultiple = selectElement.getAttribute( 'multiple' );

	// If the <select> has a specified value, that should override
	// these options
	if ( selectValue !== undefined ) {
		options.forEach( o => {
			var optionValue, shouldSelect;

			optionValue = o._ractive ? o._ractive.value : o.value;
			shouldSelect = isMultiple ? valueContains( selectValue, optionValue ) : selectValue == optionValue;

			if ( shouldSelect ) {
				optionWasSelected = true;
			}

			o.selected = shouldSelect;
		});

		if ( !optionWasSelected ) {
			if ( options[0] ) {
				options[0].selected = true;
			}

			if ( selectElement.binding ) {
				selectValue = isMultiple ? [] : ( options[0] ? ( options[0]._ractive ? options[0]._ractive.value : options[0].value ) : undefined );
				set( selectElement.root, selectElement.binding.keypath, selectValue );
			}
		}
	}

	// Otherwise the value should be initialised according to which
	// <option> element is selected, if twoway binding is in effect
	else if ( selectElement.binding ) {
		if ( isMultiple ) {
			value = options.reduce( ( array, o ) => {
				if ( o.selected ) {
					array.push( o.value );
				}

				return array;
			}, [] );
		} else {
			i = options.length;
			while ( i-- ) {
				if ( options[i].selected ) {
					value = options[i].value;
					break;
				}
			}
		}

		runloop.lockAttribute( selectElement.attributes.value );
		set( selectElement.root, selectElement.binding.keypath );
	}
}

function valueContains ( selectValue, optionValue ) {
	var i = selectValue.length;
	while ( i-- ) {
		if ( selectValue[i] == optionValue ) {
			return true;
		}
	}
}
