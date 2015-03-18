import { isArray } from 'utils/is';
import { arrayContains, removeFromArray } from 'utils/array';
import Binding from './Binding';
import getSiblings from './shared/getSiblings';
import handleDomEvent from './shared/handleDomEvent';

var CheckboxNameBinding = Binding.extend({
	name: 'name',

	getInitialValue: function () {
		// This only gets called once per group (of inputs that
		// share a name), because it only gets called if there
		// isn't an initial value. By the same token, we can make
		// a note of that fact that there was no initial value,
		// and populate it using any `checked` attributes that
		// exist (which users should avoid, but which we should
		// support anyway to avoid breaking expectations)
		this.noInitialValue = true;
		return [];
	},

	init: function () {
		var existingValue, bindingValue;

		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this

		// Each input has a reference to an array containing it and its
		// siblings, as two-way binding depends on being able to ascertain
		// the status of all inputs within the group
		this.siblings = getSiblings( this.root._guid, 'checkboxes', this.keypath.str );
		this.siblings.push( this );

		if ( this.noInitialValue ) {
			this.siblings.noInitialValue = true;
		}

		// If no initial value was set, and this input is checked, we
		// update the model
		if ( this.siblings.noInitialValue && this.element.getAttribute( 'checked' ) ) {
			existingValue = this.root.viewmodel.get( this.keypath );
			bindingValue = this.element.getAttribute( 'value' );

			existingValue.push( bindingValue );
		}
	},

	unbind: function () {
		removeFromArray( this.siblings, this );
	},

	render: function () {
		var node = this.element.node, existingValue, bindingValue;

		existingValue = this.root.viewmodel.get( this.keypath );
		bindingValue = this.element.getAttribute( 'value' );

		if ( isArray( existingValue ) ) {
			this.isChecked = arrayContains( existingValue, bindingValue );
		} else {
			this.isChecked = existingValue == bindingValue;
		}

		node.name = '{{' + this.keypath.str + '}}';
		node.checked = this.isChecked;

		node.addEventListener( 'change', handleDomEvent, false );

		// in case of IE emergency, bind to click event as well
		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleDomEvent, false );
		}
	},

	unrender: function () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'click', handleDomEvent, false );
	},

	changed: function () {
		var wasChecked = !!this.isChecked;
		this.isChecked = this.element.node.checked;
		return this.isChecked === wasChecked;
	},

	handleChange: function () {
		this.isChecked = this.element.node.checked;
		Binding.prototype.handleChange.call( this );
	},

	getValue: function () {
		return this.siblings.filter( isChecked ).map( getValue );
	}
});

function isChecked ( binding ) {
	return binding.isChecked;
}

function getValue ( binding ) {
	return binding.element.getAttribute( 'value' );
}

export default CheckboxNameBinding;
