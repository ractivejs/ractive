import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import initBinding from 'parallel-dom/items/Element/Binding/shared/initBinding';
import handleChange from 'parallel-dom/items/Element/Binding/shared/handleChange';

var SelectBinding = function ( element ) {
	initBinding( this, element );
};

SelectBinding.prototype = {
	render: function () {
		var valueFromModel;

		this.element.node.addEventListener( 'change', handleChange, false );

		/*valueFromModel = get( this.root, this.keypath );

		if ( valueFromModel === undefined ) {
			// get value from DOM, if possible
			this.handleChange();
		}*/
	},

	teardown: function () {
		this.element.node.removeEventListener( 'change', handleChange, false );
	},

	setValue: function ( value ) {
		set( this.root, this.keypath, value );
	},

	getValue: function () {
		var options, i, len, option, optionValue;

		options = this.element.node.options;
		len = options.length;

		for ( i=0; i<len; i+=1 ) {
			option = options[i];

			if ( options[i].selected ) {
				optionValue = option._ractive ? option._ractive.value : option.value;
				return optionValue;
			}
		}
	},

	handleChange: function () {
		runloop.lockAttribute( this.attribute );
		set( this.root, this.keypath, this.getValue() );
		runloop.trigger();
	},

	updateModel: function () {
		if ( this.attribute.value === undefined ) {
			set( this.root, this.keypath, this.initialValue );
		}
	},

	deferUpdate: function () {
		if ( this.deferred === true ) {
			return;
		}

		// TODO we're hijacking an existing bit of functionality here...
		// the whole deferred updates thing could use a spring clean
		runloop.addUpdate( this );
		this.deferred = true;
	},

	dirty: function () {
		if ( !this._dirty ) {
			runloop.addSelectBinding( this );
			this._dirty = true;
		}
	}
};

export default SelectBinding;
