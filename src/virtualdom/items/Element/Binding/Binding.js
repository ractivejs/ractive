import runloop from 'global/runloop';
import { warn } from 'utils/log';
import { create, extend } from 'utils/object';
import { removeFromArray } from 'utils/array';

var Binding = function ( element ) {
	var interpolator, keypath, value, parentForm;

	this.element = element;
	this.root = element.root;
	this.attribute = element.attributes[ this.name || 'value' ];

	interpolator = this.attribute.interpolator;
	interpolator.twowayBinding = this;

	if ( keypath = interpolator.keypath ) {
		if ( keypath.str.slice( -1 ) === '}' ) {
			warn( 'Two-way binding does not work with expressions (`%s` on <%s>)', interpolator.resolver.uniqueString, element.name );
			return false;
		}
	}

	else {
		// A mustache may be *ambiguous*. Let's say we were given
		// `value="{{bar}}"`. If the context was `foo`, and `foo.bar`
		// *wasn't* `undefined`, the keypath would be `foo.bar`.
		// Then, any user input would result in `foo.bar` being updated.
		//
		// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
		// left with an unresolved partial keypath - so we are forced to make an
		// assumption. That assumption is that the input in question should
		// be forced to resolve to `bar`, and any user input would affect `bar`
		// and not `foo.bar`.
		//
		// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
		// be explicit when using two-way data-binding about what keypath you're
		// updating. Using it in lists is probably a recipe for confusion...
		interpolator.resolver.forceResolution();
		keypath = interpolator.keypath;
	}

	this.attribute.isTwoway = true;
	this.keypath = keypath;

	// initialise value, if it's undefined
	value = this.root.viewmodel.get( keypath );

	if ( value === undefined && this.getInitialValue ) {
		value = this.getInitialValue();

		if ( value !== undefined ) {
			this.root.viewmodel.set( keypath, value );
		}
	}

	if ( parentForm = findParentForm( element ) ) {
		this.resetValue = value;
		parentForm.formBindings.push( this );
	}
};

Binding.prototype = {
	handleChange: function () {
		runloop.start( this.root );
		this.attribute.locked = true;
		this.root.viewmodel.set( this.keypath, this.getValue() );
		runloop.scheduleTask( () => this.attribute.locked = false );
		runloop.end();
	},

	rebound: function () {
		var bindings, oldKeypath, newKeypath;

		oldKeypath = this.keypath;
		newKeypath = this.attribute.interpolator.keypath;

		// The attribute this binding is linked to has already done the work
		if ( oldKeypath === newKeypath ) {
			return;
		}

		removeFromArray( this.root._twowayBindings[ oldKeypath.str ], this );

		this.keypath = newKeypath;

		bindings = this.root._twowayBindings[ newKeypath.str ] || ( this.root._twowayBindings[ newKeypath.str ] = [] );
		bindings.push( this );
	},

	unbind: function () {
		// this is called when the element is unbound.
		// Specialised bindings can override it
	}
};

Binding.extend = function ( properties ) {
	var Parent = this, SpecialisedBinding;

	SpecialisedBinding = function ( element ) {
		Binding.call( this, element );

		if ( this.init ) {
			this.init();
		}
	};

	SpecialisedBinding.prototype = create( Parent.prototype );
	extend( SpecialisedBinding.prototype, properties );

	SpecialisedBinding.extend = Binding.extend;

	return SpecialisedBinding;
};

export default Binding;

function findParentForm ( element ) {
	while ( element = element.parent ) {
		if ( element.name === 'form' ) {
			return element;
		}
	}
}
