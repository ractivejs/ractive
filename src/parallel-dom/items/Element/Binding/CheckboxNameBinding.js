import runloop from 'global/runloop';
import get from 'shared/get/_get';
import set from 'shared/set';
import initBinding from 'parallel-dom/items/Element/Binding/shared/initBinding';
import handleChange from 'parallel-dom/items/Element/Binding/shared/handleChange';

var CheckboxNameBinding = function ( element ) {
	initBinding( this, element, 'name' );
	this.checkboxName = true; // so that ractive.updateModel() knows what to do with this
};

CheckboxNameBinding.prototype = {
	render: function () {
		var node = this.element.node;

		this.element.node.name = '{{' + this.keypath + '}}';

		node.addEventListener( 'change', handleChange, false );

		// in case of IE emergency, bind to click event as well
		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleChange, false );
		}

		// if the model already specifies this value, check/uncheck accordingly
		if ( valueFromModel !== undefined ) {
			checked = valueFromModel.indexOf( node._ractive.value ) !== -1;
			node.checked = checked;
		}

		// otherwise make a note that we will need to update the model later
		else {
			runloop.addCheckbox( this );
		}
	},

	unrender: function () {
		this.node.removeEventListener( 'change', handleChange, false );
		this.node.removeEventListener( 'click', handleChange, false );
	},

	changed: function () {
		return this.node.checked !== !!this.checked;
	},

	handleChange: function () {
		this.checked = this.node.checked;

		runloop.lockAttribute( this.attr );
		set( this.root, this.keypath, getValueFromCheckboxes( this.root, this.keypath ) );
		runloop.trigger();
	}
};

export default CheckboxNameBinding;
