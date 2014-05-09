import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import arrayContentsMatch from 'utils/arrayContentsMatch';
import initBinding from 'parallel-dom/items/Element/Binding/shared/initBinding';
import handleChange from 'parallel-dom/items/Element/Binding/shared/handleChange';

var MultipleSelectBinding = function ( element ) {
	initBinding( this, element );
};

MultipleSelectBinding.prototype = {
	render: function () {
		var valueFromModel;

		this.element.node.addEventListener( 'change', handleChange, false );

		valueFromModel = get( this.root, this.keypath );

		if ( valueFromModel === undefined ) {
			// get value from DOM, if possible
			this.handleChange();
		}
	},

	unrender: function () {
		this.element.node.removeEventListener( 'change', handleChange, false );
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
			// either length or contents have changed, so we update the model
			runloop.lockAttribute( attribute );
			attribute.value = value;
			set( this.root, this.keypath, value );
			runloop.trigger();

		}

		return this;
	},

	updateModel: function () {
		if ( this.attribute.value === undefined || !this.attribute.value.length ) {
			set( this.root, this.keypath, this.initialValue );
		}
	},

	dirty: function () {
		if ( !this._dirty ) {
			runloop.addSelectBinding( this );
			this._dirty = true;
		}
	}
};

export default MultipleSelectBinding;
