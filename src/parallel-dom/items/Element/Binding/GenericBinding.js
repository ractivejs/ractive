import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import initBinding from 'parallel-dom/items/Element/Binding/shared/initBinding';
import handleChange from 'parallel-dom/items/Element/Binding/shared/handleChange';

var GenericBinding, getOptions;

getOptions = { evaluateWrapped: true };

GenericBinding = function ( element ) {
	initBinding( this, element, 'value' );
};

GenericBinding.prototype = {
	render: function () {
		var node = this.element.node;

		node.addEventListener( 'change', handleChange, false );

		if ( !this.root.lazy ) {
			node.addEventListener( 'input', handleChange, false );

			if ( node.attachEvent ) {
				node.addEventListener( 'keyup', handleChange, false );
			}
		}

		node.addEventListener( 'blur', handleBlur, false );
	},

	getValue: function () {
		var value = this.element.node.value;

		// if the value is numeric, treat it as a number. otherwise don't
		if ( ( +value + '' === value ) && value.indexOf( 'e' ) === -1 ) {
			value = +value;
		}

		return value;
	},

	handleChange: function () {
		runloop.lockAttribute( this.attribute );
		set( this.root, this.keypath, this.getValue() );
		runloop.trigger();
	},

	unrender: function () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleChange, false );
		node.removeEventListener( 'input', handleChange, false );
		node.removeEventListener( 'keyup', handleChange, false );
		node.removeEventListener( 'blur', handleBlur, false );
	}
};

export default GenericBinding;


function handleBlur () {
	var value;

	handleChange.call( this );

	value = get( this._ractive.root, this._ractive.binding.keypath, getOptions );
	this.value = value == undefined ? '' : value;
}
