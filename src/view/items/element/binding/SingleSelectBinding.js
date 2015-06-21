import runloop from 'global/runloop';
import Binding from './Binding';
import handleDomEvent from './handleDomEvent';

export default class SingleSelectBinding extends Binding {
	forceUpdate () {
		const value = this.getValue();

		if ( value !== undefined ) {
			this.attribute.locked = true;
			runloop.scheduleTask( () => this.attribute.locked = false );
			this.model.set( value );
		}
	}

	getInitialValue () {
		if ( this.element.getAttribute( 'value' ) !== undefined ) {
			return;
		}

		const options = this.element.options;
		const len = options.length;

		if ( !len ) return;

		let value;
		let optionWasSelected;
		let i = len;

		// take the final selected option...
		while ( i-- ) {
			const option = options[i];

			if ( option.getAttribute( 'selected' ) ) {
				if ( !option.getAttribute( 'disabled' ) ) {
					value = option.getAttribute( 'value' );
				}

				optionWasSelected = true;
				break;
			}
		}

		// or the first non-disabled option, if none are selected
		if ( !optionWasSelected ) {
			while ( ++i < len ) {
				if ( !options[i].getAttribute( 'disabled' ) ) {
					value = options[i].getAttribute( 'value' );
					break;
				}
			}
		}

		// This is an optimisation (aka hack) that allows us to forgo some
		// other more expensive work
		// TODO does it still work? seems at odds with new architecture
		if ( value !== undefined ) {
			this.element.attributeByName.value.value = value;
		}

		return value;
	}

	getValue () {
		var options, i, len, option, optionValue;

		options = this.node.options;
		len = options.length;

		for ( i = 0; i < len; i += 1 ) {
			option = options[i];

			if ( options[i].selected && !options[i].disabled ) {
				optionValue = option._ractive ? option._ractive.value : option.value;
				return optionValue;
			}
		}
	}

	render () {
		super.render();
		this.node.addEventListener( 'change', handleDomEvent, false );
	}

	// TODO this method is an anomaly... is it necessary?
	setValue ( value ) {
		this.model.set( value );
	}

	unrender () {
		this.node.removeEventListener( 'change', handleDomEvent, false );
	}
}
