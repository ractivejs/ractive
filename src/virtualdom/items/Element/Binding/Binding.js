import runloop from 'global/runloop';
import { warnIfDebug, warnOnceIfDebug } from 'utils/log';
import { create, extend } from 'utils/object';
import { removeFromArray } from 'utils/array';

var Binding = function ( element ) {
	var interpolator, value, parentForm;

	this.element = element;
	this.root = element.root;
	this.attribute = element.attributes[ this.name || 'value' ];

	interpolator = this.attribute.interpolator;
	interpolator.twowayBinding = this;

	const keypath = interpolator.keypath;

	if ( !keypath.unresolved ) {
		if ( keypath.getKeypath().slice( -1 ) === '}' ) {
			warnOnceIfDebug( 'Two-way binding does not work with expressions (`%s` on <%s>)', interpolator.keypath.key, element.name, { ractive: this.root });
			return false;
		}

		if ( keypath.key === '@key' ) { // TODO is this the best way to identify 'specials'? What about @index?
			warnOnceIfDebug( 'Two-way binding does not work with %s', interpolator.keypath.key, { ractive: this.root });
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
		let ref = interpolator.template.r ? `'${interpolator.template.r}' reference` : 'expression';
		warnIfDebug( 'The %s being used for two-way binding is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity', ref, { ractive: this.root });

		// TODO is this the correct way to force resolution?
		keypath.resolve( this.root.viewmodel.getModel( keypath.key ) );
	}

	this.attribute.isTwoway = true;
	this.keypath = keypath;

	// initialise value, if it's undefined
	value = keypath.get();

	if ( value === undefined && this.getInitialValue ) {
		value = this.getInitialValue();

		if ( value !== undefined ) {
			keypath.set( value );
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
		this.keypath.set( this.getValue() );
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

		if ( oldKeypath != null ) {
			removeFromArray( this.root._twowayBindings[ oldKeypath.getKeypath() ], this );
		}

		this.keypath = newKeypath;

		bindings = this.root._twowayBindings[ newKeypath.getKeypath() ] || ( this.root._twowayBindings[ newKeypath.getKeypath() ] = [] );
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
