import runloop from '../../../../global/runloop';
import Binding from './Binding';
import handleDomEvent from './handleDomEvent';
import { arrayContentsMatch } from '../../../../utils/array';

export default class MultipleSelectBinding extends Binding {
	forceUpdate () {
		var value = this.getValue();

		if ( value !== undefined ) {
			this.attribute.locked = true;
			runloop.scheduleTask( () => this.attribute.locked = false );
			this.model.set( value );
		}
	}

	getInitialValue () {
		return this.element.options
			.filter( option => option.getAttribute( 'selected' ) )
			.map( option => option.getAttribute( 'value' ) );
	}

	getValue () {
		const options = this.element.node.options;
		const len = options.length;

		let selectedValues = [];

		for ( let i = 0; i < len; i += 1 ) {
			const option = options[i];

			if ( option.selected ) {
				const optionValue = option._ractive ? option._ractive.value : option.value;
				selectedValues.push( optionValue );
			}
		}

		return selectedValues;
	}

	handleChange () {
		const attribute = this.attribute;
		const previousValue = attribute.getValue();

		const value = this.getValue();

		if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
			super.handleChange();
		}

		return this;
	}

	render () {
		super.render();

		this.node.addEventListener( 'change', handleDomEvent, false );

		if ( this.model.get() === undefined ) {
			// get value from DOM, if possible
			this.handleChange();
		}
	}

	setValue () {
		throw new Error( 'TODO not implemented yet' );
	}

	unrender () {
		this.node.removeEventListener( 'change', handleDomEvent, false );
	}

	updateModel () {
		if ( this.attribute.value === undefined || !this.attribute.value.length ) {
			this.keypath.set( this.initialValue );
		}
	}
}
