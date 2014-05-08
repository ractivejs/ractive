import inheritProperties from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/inheritProperties';
import updateModel from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModel';
import updateModelAndView from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModelAndView';

var MultipleSelectBinding = function ( attribute, node ) {
	var valueFromModel;

	inheritProperties( this, attribute, node );
	node.addEventListener( 'change', updateModel, false );

	valueFromModel = get( this.root, this.keypath );

	if ( valueFromModel === undefined ) {
		// get value from DOM, if possible
		this.update();
	}
};

MultipleSelectBinding.prototype = {
	value: function () {
		var selectedValues, options, i, len, option, optionValue;

		selectedValues = [];
		options = this.node.options;
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

	update: function () {
		var attribute, previousValue, value;

		attribute = this.attr;
		previousValue = attribute.value;

		value = this.value();

		if ( previousValue === undefined || !arrayContentsMatch( value, previousValue ) ) {
			// either length or contents have changed, so we update the model
			runloop.addBinding( attribute );
			attribute.value = value;
			set( this.root, this.keypath, value );
			runloop.trigger();

		}

		return this;
	},

	deferUpdate: function () {
		if ( this.deferred === true ) {
			return;
		}

		// TODO we're hijacking an existing bit of functionality here...
		// the whole deferred updates thing could use a spring clean
		runloop.addAttribute( this );
		this.deferred = true;
	},

	teardown: function () {
		this.node.removeEventListener( 'change', updateModel, false );
	}
};

export default MultipleSelectBinding;
