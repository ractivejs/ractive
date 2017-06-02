import runloop from '../../../../global/runloop';
import Binding from './Binding';
import handleDomEvent from './handleDomEvent';
import getSelectedOptions from '../../../../utils/getSelectedOptions';

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
		const options = this.node.options;
		const len = options.length;

		let i;
		for ( i = 0; i < len; i += 1 ) {
			const option = options[i];

			if ( options[i].selected && !options[i].disabled ) {
				return option._ractive ? option._ractive.value : option.value;
			}
		}
	}

	render () {
		super.render();
		this.element.on( 'change', handleDomEvent );
	}

	setFromNode ( node ) {
		const option = getSelectedOptions( node )[0];
		this.model.set( option._ractive ? option._ractive.value : option.value );
	}

	unrender () {
		this.element.off( 'change', handleDomEvent );
	}
}
