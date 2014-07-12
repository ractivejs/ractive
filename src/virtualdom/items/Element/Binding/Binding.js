import runloop from 'global/runloop';
import warn from 'utils/warn';
import create from 'utils/create';
import extend from 'utils/extend';
import removeFromArray from 'utils/removeFromArray';

var Binding = function ( element ) {
	var interpolator, keypath, value;

	this.element = element;
	this.root = element.root;
	this.attribute = element.attributes[ this.name || 'value' ];

	interpolator = this.attribute.interpolator;
	interpolator.twowayBinding = this;

	if ( interpolator.keypath && interpolator.keypath.substr === '${' ) {
		warn( 'Two-way binding does not work with expressions: ' + interpolator.keypath );
		return false;
	}

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
	if ( !interpolator.keypath ) {
		if ( interpolator.ref ) {
			interpolator.resolve( interpolator.ref );
		}

		// If we have a reference expression resolver, we have to force
		// members to attach themselves to the root
		if ( interpolator.resolver ) {
			interpolator.resolver.forceResolution();
		}
	}

	this.keypath = keypath = interpolator.keypath;

	// initialise value, if it's undefined
	if ( this.root.viewmodel.get( keypath ) === undefined && this.getInitialValue ) {
		value = this.getInitialValue();

		if ( value !== undefined ) {
			this.root.viewmodel.set( keypath, value );
		}
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

		removeFromArray( this.root._twowayBindings[ oldKeypath ], this );

		this.keypath = newKeypath;

		bindings = this.root._twowayBindings[ newKeypath ] || ( this.root._twowayBindings[ newKeypath ] = [] );
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
