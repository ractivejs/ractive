import types from 'config/types';
import namespaces from 'config/namespaces';
import enforceCase from 'virtualdom/items/Element/shared/enforceCase';
import getElementNamespace from 'virtualdom/items/Element/prototype/init/getElementNamespace';
import createAttributes from 'virtualdom/items/Element/prototype/init/createAttributes';
import createTwowayBinding from 'virtualdom/items/Element/prototype/init/createTwowayBinding';
import createEventHandlers from 'virtualdom/items/Element/prototype/init/createEventHandlers';
import Decorator from 'virtualdom/items/Element/Decorator/_Decorator';
import Transition from 'virtualdom/items/Element/Transition/_Transition';
import bubbleSelect from 'virtualdom/items/Element/special/select/bubble';
import initOption from 'virtualdom/items/Element/special/option/init';

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
		initOption( this, template );
	}

	// Special case - <select> elements
	if ( this.name === 'select' ) {
		this.options = [];
		this.bubble = bubbleSelect; // TODO this is a kludge
	}

	// create attributes
	this.attributes = createAttributes( this, template.a );


	// append children, if there are any
	if ( template.f ) {
		this.fragment = new Fragment({
			template: template.f,
			root:     ractive,
			owner:    this,
			pElement: this,
		});
	}


	// create twoway binding
	if ( ractive.twoway && ( binding = createTwowayBinding( this, template.a ) ) ) {
		this.binding = binding;

		// register this with the root, so that we can do ractive.updateModel()
		bindings = this.root._twowayBindings[ binding.keypath ] || ( this.root._twowayBindings[ binding.keypath ] = [] );
		bindings.push( binding );
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


	/*
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
	*/
}
