import runloop from 'global/runloop';
import { warnIfDebug, warnOnceIfDebug } from 'utils/log';

// TODO element.parent currently undefined
function findParentForm ( element ) {
	while ( element = element.parent ) {
		if ( element.name === 'form' ) {
			return element;
		}
	}
}

function warnAboutAmbiguity ( description, ractive ) {
	warnOnceIfDebug( `The ${description} being used for two-way binding is ambiguous, and may cause unexpected results. Consider initialising your data to eliminate the ambiguity`, { ractive });
}

export default class Binding {
	constructor ( element, name = 'value' ) {
		this.element = element;
		this.ractive = element.ractive;
		this.attribute = element.attributeByName[ name ];

		const interpolator = this.attribute.interpolator;
		interpolator.twowayBinding = this;

		let model = interpolator.model;

		// not bound?
		if ( !model ) {
			// try to force resolution
			interpolator.resolver.forceResolution();
			model = interpolator.model;

			warnAboutAmbiguity( `'${interpolator.template.r}' reference`, this.ractive );
		}

		else if ( model.isUnresolved ) {
			// reference expressions (e.g. foo[bar])
			model.forceResolution();
			warnAboutAmbiguity( 'expression', this.ractive );
		}

		// TODO include index/key/keypath refs as read-only
		else if ( model.isReadonly ) {
			const keypath = model.getKeypath().replace( /^@/, '' );
			warnOnceIfDebug( `Cannot use two-way binding on <${element.name}> element: ${keypath} is read-only. To suppress this warning use <${element.name} twoway='false'...>`, { ractive: this.ractive });
			return false;
		}

		this.attribute.isTwoway = true;
		this.model = model;

		// initialise value, if it's undefined
		let value = model.get();

		if ( value === undefined && this.getInitialValue ) {
			value = this.getInitialValue();
			model.set( value );
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
	// rebound () {
	// 	var bindings, oldKeypath, newKeypath;
	//
	// 	oldKeypath = this.keypath;
	// 	newKeypath = this.attribute.interpolator.model;
	//
	// 	// The attribute this binding is linked to has already done the work
	// 	if ( oldKeypath === newKeypath ) {
	// 		return;
	// 	}
	//
	// 	if ( oldKeypath != null ) {
	// 		removeFromArray( this.root._twowayBindings[ oldKeypath.getKeypath() ], this );
	// 	}
	//
	// 	this.keypath = newKeypath;
	//
	// 	bindings = this.root._twowayBindings[ newKeypath.getKeypath() ] || ( this.root._twowayBindings[ newKeypath.getKeypath() ] = [] );
	// 	bindings.push( this );
	// }

	render () {
		this.node = this.element.node;
		this.node._ractive.binding = this;
		this.rendered = true; // TODO is this used anywhere?
	}

	unbind () {
		this.model.unregisterTwowayBinding( this );
	}

	unrender () {
		// noop?
	}
}
