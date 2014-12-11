import types from 'config/types';
import enforceCase from 'virtualdom/items/Element/shared/enforceCase';
import processBindingAttributes from 'virtualdom/items/Element/prototype/init/processBindingAttributes';
import createAttributes from 'virtualdom/items/Element/prototype/init/createAttributes';
import createConditionalAttributes from 'virtualdom/items/Element/prototype/init/createConditionalAttributes';
import createTwowayBinding from 'virtualdom/items/Element/prototype/init/createTwowayBinding';
import createEventHandlers from 'virtualdom/items/Element/prototype/init/createEventHandlers';
import Decorator from 'virtualdom/items/Element/Decorator/_Decorator';
import bubbleSelect from 'virtualdom/items/Element/special/select/bubble';
import initOption from 'virtualdom/items/Element/special/option/init';
import Fragment from 'virtualdom/Fragment';

export default function Element$init ( options ) {
	var parentFragment,
		template,
		ractive,
		binding,
		bindings,
		twoway;

	this.type = types.ELEMENT;

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
	this.intro = template.t0 || template.t1;
	this.outro = template.t0 || template.t2;
}
