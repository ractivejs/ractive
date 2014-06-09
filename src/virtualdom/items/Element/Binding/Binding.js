import runloop from 'global/runloop';
import warn from 'utils/warn';
import create from 'utils/create';
import extend from 'utils/extend';

var Binding = function ( element ) {
	var interpolator;

	this.element = element;
	this.root = element.root;
	this.attribute = element.attributes[ this.name || 'value' ];

	interpolator = this.attribute.interpolator;

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
		// TODO: What about rx?
		interpolator.resolve( interpolator.ref );
	}

	this.keypath = this.attribute.interpolator.keypath;

	// initialise value, if it's undefined
	// TODO could we use a similar mechanism instead of the convoluted
	// select/checkbox init logic?
	if ( this.root.viewmodel.get( this.keypath ) === undefined && this.getInitialValue ) {
		this.root.viewmodel.set( this.keypath, this.getInitialValue() );
	}
};

Binding.prototype = {
	handleChange: function () {
		runloop.lockAttribute( this.attribute );
		runloop.start( this.root );
		this.root.viewmodel.set( this.keypath, this.getValue() );
		runloop.end();
	},

	rebind: function ( indexRef, newIndex, oldKeypath, newKeypath ) {
		var bindings;

		if ( this.keypath.substr( 0, oldKeypath.length ) === oldKeypath ) {
			bindings = this.root._twowayBindings[ this.keypath ];

			// remove binding reference for old keypath
			bindings.splice( bindings.indexOf( this ), 1 );

			// update keypath
			this.keypath = this.keypath.replace( oldKeypath, newKeypath );

			// add binding reference for new keypath
			bindings = this.root._twowayBindings[ this.keypath ] || ( this.root._twowayBindings[ this.keypath ] = [] );
			bindings.push( this );
		}
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
