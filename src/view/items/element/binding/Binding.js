import runloop from '../../../../global/runloop';
import { warnOnceIfDebug } from '../../../../utils/log';
import findElement from '../../shared/findElement';
import noop from '../../../../utils/noop';

export default class Binding {
	constructor ( element, name = 'value' ) {
		this.element = element;
		this.ractive = element.ractive;
		this.attribute = element.attributeByName[ name ];

		const interpolator = this.attribute.interpolator;
		interpolator.twowayBinding = this;

		const model = interpolator.model;

		if ( model.isReadonly && !model.setRoot ) {
			const keypath = model.getKeypath().replace( /^@/, '' );
			warnOnceIfDebug( `Cannot use two-way binding on <${element.name}> element: ${keypath} is read-only. To suppress this warning use <${element.name} twoway='false'...>`, { ractive: this.ractive });
			return false;
		}

		this.attribute.isTwoway = true;
		this.model = model;

		// initialise value, if it's undefined
		let value = model.get();
		this.wasUndefined = value === undefined;

		if ( value === undefined && this.getInitialValue ) {
			value = this.getInitialValue();
			model.set( value );
		}
		this.lastVal( true, value );

		const parentForm = findElement( this.element, false, 'form' );
		if ( parentForm ) {
			this.resetValue = value;
			parentForm.formBindings.push( this );
		}
	}

	bind () {
		this.model.registerTwowayBinding( this );
	}

	handleChange () {
		const value = this.getValue();
		if ( this.lastVal() === value ) return;

		runloop.start( this.root );
		this.attribute.locked = true;
		this.model.set( value );
		this.lastVal( true, value );

		// if the value changes before observers fire, unlock to be updatable cause something weird and potentially freezy is up
		if ( this.model.get() !== value ) this.attribute.locked = false;
		else runloop.scheduleTask( () => this.attribute.locked = false );

		runloop.end();
	}

	lastVal ( setting, value ) {
		if ( setting ) this.lastValue = value;
		else return this.lastValue;
	}

	rebind ( next, previous ) {
		if ( this.model && this.model === previous ) previous.unregisterTwowayBinding( this );
		if ( next ) {
			this.model = next;
			runloop.scheduleTask( () => next.registerTwowayBinding( this ) );
		}
	}

	render () {
		this.node = this.element.node;
		this.node._ractive.binding = this;
		this.rendered = true; // TODO is this used anywhere?
	}

	setFromNode ( node ) {
		this.model.set( node.value );
	}

	unbind () {
		this.model.unregisterTwowayBinding( this );
	}
}

Binding.prototype.unrender = noop;
