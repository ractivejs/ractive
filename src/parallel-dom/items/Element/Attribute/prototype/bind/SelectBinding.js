import inheritProperties from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/inheritProperties';
import updateModel from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModel';
import updateModelAndView from 'parallel-dom/items/Element/Attribute/prototype/bind/helpers/updateModelAndView';

var SelectBinding = function ( attribute, node ) {
	var valueFromModel;

	inheritProperties( this, attribute, node );
	node.addEventListener( 'change', updateModel, false );

	valueFromModel = get( this.root, this.keypath );

	if ( valueFromModel === undefined ) {
		// get value from DOM, if possible
		this.update();
	}
};

SelectBinding.prototype = {
	value: function () {
		var options, i, len, option, optionValue;

		options = this.node.options;
		len = options.length;

		for ( i=0; i<len; i+=1 ) {
			option = options[i];

			if ( options[i].selected ) {
				optionValue = option._ractive ? option._ractive.value : option.value;
				return optionValue;
			}
		}
	},

	update: function () {
		var value = this.value();

		runloop.addBinding( this.attr );
		this.attr.value = value;
		set( this.root, this.keypath, value );
		runloop.trigger();

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

export default SelectBinding;
