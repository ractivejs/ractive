import types from 'config/types';
import enforceCase from 'virtualdom/items/Element/shared/enforceCase';
import processBindingAttributes from 'virtualdom/items/Element/prototype/init/processBindingAttributes';
import createAttributes from 'virtualdom/items/Element/prototype/init/createAttributes';
import createConditionalAttributes from 'virtualdom/items/Element/prototype/init/createConditionalAttributes';
import bindingHelpers from 'virtualdom/items/Element/prototype/bindingHelpers';
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
		ractive;

	this.type = types.ELEMENT;

	// stuff we'll need later
	parentFragment = this.parentFragment = options.parentFragment;
	template = this.template = options.template;

	this.parent = options.pElement || parentFragment.pElement;

	this.root = ractive = parentFragment.root;
	this.index = options.index;

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

	this.twoway = ractive.twoway;
	this.lazy = ractive.lazy;
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

	// create twoway binding
	bindingHelpers.registerTwowayBinding( this );

	// create event proxies
	if ( template.v ) {
		bindingHelpers.registerEventHandlers( this );
	}

	// create decorator
	if ( template.o ) {
		bindingHelpers.registerDecorator( this );
	}

	// create transitions
	this.intro = template.t0 || template.t1;
	this.outro = template.t0 || template.t2;
}
