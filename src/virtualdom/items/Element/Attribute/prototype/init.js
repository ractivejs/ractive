import { ATTRIBUTE } from 'config/types';
import { booleanAttributes } from 'utils/html';
import determineNameAndNamespace from '../helpers/determineNameAndNamespace';
import getInterpolator from '../helpers/getInterpolator';
import Fragment from 'virtualdom/Fragment';

export default function Attribute$init ( options ) {
	this.type = ATTRIBUTE;
	this.element = options.element;
	this.root = options.root;

	determineNameAndNamespace( this, options.name );
	this.isBoolean = booleanAttributes.test( this.name );

	// if it's an empty attribute, or just a straight key-value pair, with no
	// mustache shenanigans, set the attribute accordingly and go home
	if ( !options.value || typeof options.value === 'string' ) {
		this.value = this.isBoolean ? true : options.value || '';
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

	// TODO can we use this.fragment.toString() in some cases? It's quicker
	this.value = this.fragment.getValue();

	// Store a reference to this attribute's interpolator, if its fragment
	// takes the form `{{foo}}`. This is necessary for two-way binding and
	// for correctly rendering HTML later
	this.interpolator = getInterpolator( this );
	this.isBindable = !!this.interpolator && !this.interpolator.isStatic;

	// mark as ready
	this.ready = true;
}
