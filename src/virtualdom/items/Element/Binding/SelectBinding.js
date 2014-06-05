import runloop from 'global/runloop';
import set from 'shared/set';
import Binding from 'virtualdom/items/Element/Binding/Binding';
import handleDomEvent from 'virtualdom/items/Element/Binding/shared/handleDomEvent';

var SelectBinding = Binding.extend({
	getInitialValue: function () {
		var options = this.element.options, len, i, value;

		i = options.length;

		if ( !i ) {
			return;
		}

		// take the final selected option...
		while ( i-- ) {
			if ( options[i].getAttribute( 'selected' ) ) {
				return options[i].getAttribute( 'value' );
			}
		}

		// or the first option, if none are selected
		return options[0].getAttribute( 'value' );
	},

	render: function () {
		this.element.node.addEventListener( 'change', handleDomEvent, false );
	},

	unrender: function () {
		this.element.node.removeEventListener( 'change', handleDomEvent, false );
	},

	setValue: function ( value ) {
		set( this.root, this.keypath, value );
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

	dirty: function () {
		if ( !this._dirty ) {
			this._dirty = true;

			// If there was no initially selected value, we may be
			// able to set one now
			if ( this.attribute.value === undefined ) {
				runloop.afterModelUpdate( () => {
					set( this.root, this.keypath, this.getInitialValue() );
				});
			}
		}
	}
});

export default SelectBinding;
