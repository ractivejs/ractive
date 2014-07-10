import runloop from 'global/runloop';
import Binding from 'virtualdom/items/Element/Binding/Binding';
import handleDomEvent from 'virtualdom/items/Element/Binding/shared/handleDomEvent';

var SelectBinding = Binding.extend({
	getInitialValue: function () {
		var options = this.element.options, len, i;

		i = len = options.length;

		if ( !len ) {
			return;
		}

		// take the final selected option...
		while ( i-- ) {
			if ( options[i].getAttribute( 'selected' ) ) {
				return options[i].getAttribute( 'value' );
			}
		}

		// or the first non-disabled option, if none are selected
		while ( ++i < len ) {
			if ( !options[i].getAttribute( 'disabled' ) ) {
				return options[i].getAttribute( 'value' );
			}
		}
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
