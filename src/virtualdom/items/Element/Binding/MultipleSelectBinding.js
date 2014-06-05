import get from 'shared/get';
import set from 'shared/set';
import arrayContentsMatch from 'utils/arrayContentsMatch';
import SelectBinding from 'virtualdom/items/Element/Binding/SelectBinding';
import handleDomEvent from 'virtualdom/items/Element/Binding/shared/handleDomEvent';

var MultipleSelectBinding = SelectBinding.extend({
	getInitialValue: function () {
		return this.element.options
			.filter( option => option.getAttribute( 'selected' ) )
			.map( option => option.getAttribute( 'value' ) );
	},

	render: function () {
		var valueFromModel;

		this.element.node.addEventListener( 'change', handleDomEvent, false );

		valueFromModel = get( this.root, this.keypath );

		if ( valueFromModel === undefined ) {
			// get value from DOM, if possible
			this.handleChange();
		}
	},

	setValue: function () {
		throw new Error( 'TODO not implemented yet' );
	},

	getValue: function () {
		var selectedValues, options, i, len, option, optionValue;

		selectedValues = [];
		options = this.element.node.options;
		len = options.length;

		for ( i=0; i<len; i+=1 ) {
			option = options[i];

			if ( option.selected ) {
				optionValue = option._ractive ? option._ractive.value : option.value;
				selectedValues.push( optionValue );
			}
		}

		return selectedValues;
	},

	handleChange: function () {
		var attribute, previousValue, value;

		attribute = this.attribute;
		previousValue = attribute.value;

		value = this.getValue();

		if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
			SelectBinding.prototype.handleChange.call( this );
		}

		return this;
	},

	updateModel: function () {
		if ( this.attribute.value === undefined || !this.attribute.value.length ) {
			set( this.root, this.keypath, this.initialValue );
		}
	}
});

export default MultipleSelectBinding;
