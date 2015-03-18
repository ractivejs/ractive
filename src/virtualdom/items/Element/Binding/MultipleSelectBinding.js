import runloop from 'global/runloop';
import { arrayContentsMatch } from 'utils/array';
import SelectBinding from './SelectBinding';
import handleDomEvent from './shared/handleDomEvent';

var MultipleSelectBinding = SelectBinding.extend({
	getInitialValue: function () {
		return this.element.options
			.filter( option => option.getAttribute( 'selected' ) )
			.map( option => option.getAttribute( 'value' ) );
	},

	render: function () {
		var valueFromModel;

		this.element.node.addEventListener( 'change', handleDomEvent, false );

		valueFromModel = this.root.viewmodel.get( this.keypath );

		if ( valueFromModel === undefined ) {
			// get value from DOM, if possible
			this.handleChange();
		}
	},

	unrender: function () {
		this.element.node.removeEventListener( 'change', handleDomEvent, false );
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

	forceUpdate: function () {
		var value = this.getValue();

		if ( value !== undefined ) {
			this.attribute.locked = true;
			runloop.scheduleTask( () => this.attribute.locked = false );
			this.root.viewmodel.set( this.keypath, value );
		}
	},

	updateModel: function () {
		if ( this.attribute.value === undefined || !this.attribute.value.length ) {
			this.root.viewmodel.set( this.keypath, this.initialValue );
		}
	}
});

export default MultipleSelectBinding;
