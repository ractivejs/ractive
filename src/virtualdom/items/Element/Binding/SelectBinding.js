import runloop from 'global/runloop';
import set from 'shared/set';
import Binding from 'virtualdom/items/Element/Binding/Binding';
import handleDomEvent from 'virtualdom/items/Element/Binding/shared/handleDomEvent';

var SelectBinding = Binding.extend({
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

	updateModel: function () {
		if ( this.attribute.value === undefined ) {
			set( this.root, this.keypath, this.initialValue );
		}
	},

	dirty: function () {
		if ( !this._dirty ) {
			this._dirty = true;
			runloop.afterModelUpdate( () => this.updateModel() );

		}
	}
});

export default SelectBinding;
