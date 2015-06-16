import runloop from 'global/runloop';
import { warnOnceIfDebug } from 'utils/log';

// TODO element.parent currently undefined
function findParentForm ( element ) {
	while ( element = element.parent ) {
		if ( element.name === 'form' ) {
			return element;
		}
	}
}

export default class Binding {
	constructor ( element, name = 'value' ) {
		this.element = element;
		this.ractive = element.ractive;
		this.attribute = element.attributeByName[ name  ];

		const interpolator = this.attribute.interpolator;
		interpolator.twowayBinding = this;

		const model = interpolator.model;

		// TODO does this still work?
		if ( model.getKeypath().slice( -1 ) === '}' ) {
			warnOnceIfDebug( 'Two-way binding does not work with expressions (`%s` on <%s>)', interpolator.model.key, element.name, { ractive: this.root });
			return false;
		}

		if ( model.key === '@key' ) { // TODO is this the best way to identify 'specials'? What about @index?
			warnOnceIfDebug( 'Two-way binding does not work with %s', interpolator.model.key, { ractive: this.root });
			return false;
		}

		// if ( keypath.isUnresolved ) {
		// 	// A mustache may be *ambiguous*. Let's say we were given
		// 	// `value="{{bar}}"`. If the model was `foo`, and `foo.bar`
		// 	// *wasn't* `undefined`, the keypath would be `foo.bar`.
		// 	// Then, any user input would result in `foo.bar` being updated.
		// 	//
		// 	// If, however, `foo.bar` *was* undefined, and so was `bar`, we would be
		// 	// left with an unresolved partial keypath - so we are forced to make an
		// 	// assumption. That assumption is that the input in question should
		// 	// be forced to resolve to `bar`, and any user input would affect `bar`
		// 	// and not `foo.bar`.
		// 	//
		// 	// Did that make any sense? No? Oh. Sorry. Well the moral of the story is
		// 	// be explicit when using two-way data-binding about what keypath you're
		// 	// updating. Using it in lists is probably a recipe for confusion...
		// 	let ref = interpolator.template.r ? `'${interpolator.template.r}' reference` : 'expression';
		// 	warnIfDebug( 'The %s being used for two-way binding is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity', ref, { ractive: this.root });
		// }

		this.attribute.isTwoway = true;
		this.model = model;

		// initialise value, if it's undefined
		let value = model.get();

		if ( value === undefined && this.getInitialValue ) {
			value = this.getInitialValue();

			if ( value !== undefined /*&& value.length !== 0*/ ) {
				model.set( value, true );
				// we don't wan't to do model.set( value )
				//model.value = value;
			}
		}

		const parentForm = findParentForm( element );
		if ( parentForm ) {
			this.resetValue = value;
			parentForm.formBindings.push( this );
		}
	}

	bind () {
		this.model.registerTwowayBinding( this );
	}

	handleChange () {
		runloop.start( this.root );
		this.attribute.locked = true;
		this.model.set( this.getValue() );
		runloop.scheduleTask( () => this.attribute.locked = false );
		runloop.end();
	}

	// TODO still necessary?
	rebound () {
		var bindings, oldKeypath, newKeypath;

		oldKeypath = this.keypath;
		newKeypath = this.attribute.interpolator.model;

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
	}

	render () {
		this.node = this.element.node;
		this.node._ractive.binding = this;
		this.rendered = true;
	}

	unbind () {
		this.model.unregisterTwowayBinding( this );
		// this is called when the element is unbound.
		// Specialised bindings can override it
	}
}
