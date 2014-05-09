import runloop from 'global/runloop';
import set from 'shared/set';
import initBinding from 'parallel-dom/items/Element/Binding/shared/initBinding';
import handleChange from 'parallel-dom/items/Element/Binding/shared/handleChange';

var CheckedBinding = function ( element ) {
	initBinding( this, element, 'checked' );
};

CheckedBinding.prototype = {
	render: function () {
		var node = this.element.node;

		node.addEventListener( 'change', handleChange, false );

		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleChange, false );
		}
	},

	unrender: function () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleChange, false );
		node.removeEventListener( 'click', handleChange, false );
	},

	getValue: function () {
		return this.element.node.checked;
	},

	handleChange: function () {
		runloop.lockAttribute( this );
		set( this.root, this.keypath, this.getValue() );
		runloop.trigger();
	}
};

export default CheckedBinding;
