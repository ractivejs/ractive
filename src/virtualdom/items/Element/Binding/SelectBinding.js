import runloop from 'global/runloop';
import Binding from 'virtualdom/items/Element/Binding/Binding';
import handleDomEvent from 'virtualdom/items/Element/Binding/shared/handleDomEvent';

var SelectBinding = Binding.extend({
	getInitialValue: function () {
		var options = this.element.options, len, i, value, optionWasSelected;

		if ( this.element.getAttribute( 'value' ) !== undefined ) {
			return;
		}

		i = len = options.length;

		if ( !len ) {
			return;
		}

		// take the final selected option...
		while ( i-- ) {
			if ( options[i].getAttribute( 'selected' ) ) {
				value = options[i].getAttribute( 'value' );
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
		if ( value !== undefined ) {
			this.element.attributes.value.value = value;
		}

		return value;
	},

	render: function () {
		this.element.node.addEventListener( 'change', handleDomEvent, false );
	},

	unrender: function () {
		this.element.node.removeEventListener( 'change', handleDomEvent, false );
	},

	// TODO this method is an anomaly... is it necessary?
	setValue: function ( value ) {
		runloop.addViewmodel( this.root.viewmodel );
		this.root.viewmodel.set( this.keypath, value );
	},

	getValue: function () {
		var options, i, len, option, optionValue;

		options = this.element.node.options;
		len = options.length;

		for ( i = 0; i < len; i += 1 ) {
			option = options[i];

			if ( options[i].selected ) {
				optionValue = option._ractive ? option._ractive.value : option.value;
				return optionValue;
			}
		}
	},

	forceUpdate: function () {
		var value = this.getValue();

		if ( value !== undefined ) {
			this.attribute.locked = true;
			runloop.addViewmodel( this.root.viewmodel );
			runloop.scheduleTask( () => this.attribute.locked = false );
			this.root.viewmodel.set( this.keypath, value );
		}
	}
});

export default SelectBinding;
