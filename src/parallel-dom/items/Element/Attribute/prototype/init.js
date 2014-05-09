import types from 'config/types';
import determineNameAndNamespace from 'parallel-dom/items/Element/Attribute/helpers/determineNameAndNamespace';
import getInterpolator from 'parallel-dom/items/Element/Attribute/helpers/getInterpolator';
import determinePropertyName from 'parallel-dom/items/Element/Attribute/helpers/determinePropertyName';

import circular from 'circular';

var Fragment;

circular.push( function () {
	Fragment = circular.Fragment;
});

export default function Attribute$init ( options ) {
	this.type = types.ATTRIBUTE;
	this.element = options.element;
	this.root = options.root;

	determineNameAndNamespace( this, options.name );

	// if it's an empty attribute, or just a straight key-value pair, with no
	// mustache shenanigans, set the attribute accordingly and go home
	if ( !options.value || typeof options.value === 'string' ) {
		this.value = options.value || true;
		return;
	}

	// otherwise we need to do some work

	// share parentFragment with parent element
	this.parentFragment = this.element.parentFragment;

	this.fragment = new Fragment({
		template: options.value,
		root:     this.root,
		owner:    this
	});

	this.value = this.fragment.getValue();


	// Store a reference to this attribute's interpolator, if its fragment
	// takes the form `{{foo}}`. This is necessary for two-way binding and
	// for correctly rendering HTML later
	this.interpolator = getInterpolator( this );

	// special cases
	if ( this.name === 'value' ) {
		this.isValueAttribute = true;

		// TODO need to wait until afterwards to determine type, in case we
		// haven't initialised that attribute yet
		// <input type='file' value='{{value}}'>
		/*if ( this.element.name === 'input' && this.element.attributes.type && this.element.attributes.type.value === 'file' ) {
			this.isFileInputValue = true;
		}*/
	}

	// can we establish this attribute's property name equivalent?
	determinePropertyName( this, options );

	// determine whether this attribute can be marked as self-updating
	this.selfUpdating = this.fragment.isSimple();

	// mark as ready
	this.ready = true;
}
