import { ELEMENT } from 'config/types';
import processBindingAttributes from './init/processBindingAttributes';
import createAttributes from './init/createAttributes';
import createConditionalAttributes from './init/createConditionalAttributes';
import createTwowayBinding from './init/createTwowayBinding';
import createEventHandlers from './init/createEventHandlers';
import enforceCase from '../shared/enforceCase';
import Decorator from '../Decorator/_Decorator';
import { bubble as bubbleSelect } from '../special/select';
import { init as initOption } from '../special/option';
import Fragment from 'virtualdom/Fragment';

export default function Element$init ( options ) {
	var parentFragment,
		template,
		ractive,
		binding,
		bindings,
		twoway;

	this.type = ELEMENT;

	// stuff we'll need later
	parentFragment = this.parentFragment = options.parentFragment;
	template = this.template = options.template;

	this.parent = options.pElement || parentFragment.pElement;

	this.root = ractive = parentFragment.root;
	this.index = options.index;
	this.key = options.key;

	this.name = enforceCase( template.e );

	// Special case - <option> elements
	if ( this.name === 'option' ) {
		initOption( this, template );
	}

	// Special case - <select> elements
	if ( this.name === 'select' ) {
		this.options = [];
		this.bubble = bubbleSelect; // TODO this is a kludge
	}

	// Special case - <form> elements
	if ( this.name === 'form' ) {
		this.formBindings = [];
	}

	// handle binding attributes first (twoway, lazy)
	processBindingAttributes( this, template.a || {} );

	// create attributes
	this.attributes = createAttributes( this, template.a );
	this.conditionalAttributes = createConditionalAttributes( this, template.m );

	// append children, if there are any
	if ( template.f ) {
		this.fragment = new Fragment({
			template: template.f,
			root:     ractive,
			owner:    this,
			pElement: this,
		});
	}

	// the element setting should override the ractive setting
	twoway = ractive.twoway;
	if ( this.twoway === false ) twoway = false;
	else if ( this.twoway === true ) twoway = true;

	// create twoway binding
	if ( twoway && ( binding = createTwowayBinding( this, template.a ) ) ) {
		this.binding = binding;

		// register this with the root, so that we can do ractive.updateModel()
		bindings = this.root._twowayBindings[ binding.keypath.str ] || ( this.root._twowayBindings[ binding.keypath.str ] = [] );
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
	this.intro = template.t0 || template.t1;
	this.outro = template.t0 || template.t2;
}
