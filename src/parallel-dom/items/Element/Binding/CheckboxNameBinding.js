import runloop from 'global/runloop';
import get from 'shared/get/_get';
import Binding from 'parallel-dom/items/Element/Binding/Binding';
import handleDomEvent from 'parallel-dom/items/Element/Binding/shared/handleDomEvent';

var CheckboxNameBinding = Binding.extend({
	name: 'name',

	init: function () {
		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this
	},

	render: function () {
		var node = this.element.node, valueFromModel, checked;

		this.element.node.name = '{{' + this.keypath + '}}';

		node.addEventListener( 'change', handleDomEvent, false );

		// in case of IE emergency, bind to click event as well
		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleDomEvent, false );
		}

		valueFromModel = get( this.root, this.keypath );

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
		this.node.removeEventListener( 'change', handleDomEvent, false );
		this.node.removeEventListener( 'click', handleDomEvent, false );
	},

	changed: function () {
		return this.element.node.checked !== !!this.checked;
	},

	handleChange: function () {
		this.checked = this.element.node.checked;
		Binding.prototype.handleChange.call( this );
	}
});

export default CheckboxNameBinding;
