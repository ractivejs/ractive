import Binding from './Binding';
import { isArray } from 'utils/is';
import { arrayContains, removeFromArray } from 'utils/array';
import getSiblings from './getSiblings';
import handleDomEvent from './handleDomEvent';

function isChecked ( binding ) {
	return binding.isChecked;
}

function getValue ( binding ) {
	return binding.element.getAttribute( 'value' );
}

export default class CheckboxNameBinding extends Binding {
	constructor ( element ) {
		super( element, 'name' );

		var existingValue, bindingValue;

		this.checkboxName = true; // so that ractive.updateModel() knows what to do with this

		// Each input has a reference to an array containing it and its
		// siblings, as two-way binding depends on being able to ascertain
		// the status of all inputs within the group
		this.siblings = getSiblings( this.ractive._guid, 'checkboxes', this.model.getKeypath() );
		this.siblings.push( this );

		if ( this.noInitialValue ) {
			this.siblings.noInitialValue = true;
		}

		// If no initial value was set, and this input is checked, we
		// update the model
		if ( this.siblings.noInitialValue && this.element.getAttribute( 'checked' ) ) {
			existingValue = this.model.value;
			bindingValue = this.element.getAttribute( 'value' );

			existingValue.push( bindingValue );
		}
	}

	changed () {
		var wasChecked = !!this.isChecked;
		this.isChecked = this.node.checked;
		return this.isChecked === wasChecked;
	}

	getInitialValue () {
		// This only gets called once per group (of inputs that
		// share a name), because it only gets called if there
		// isn't an initial value. By the same token, we can make
		// a note of that fact that there was no initial value,
		// and populate it using any `checked` attributes that
		// exist (which users should avoid, but which we should
		// support anyway to avoid breaking expectations)
		this.noInitialValue = true;
		return [];
	}

	getValue () {
		return this.siblings.filter( isChecked ).map( getValue );
	}

	handleChange () {
		this.isChecked = this.element.node.checked;
		super.handleChange();
	}

	render () {
		super.render();

		const node = this.node;

		const existingValue = this.model.get();
		const bindingValue = this.element.getAttribute( 'value' );

		if ( isArray( existingValue ) ) {
			this.isChecked = arrayContains( existingValue, bindingValue );
		} else {
			this.isChecked = existingValue == bindingValue;
		}

		node.name = '{{' + this.model.getKeypath() + '}}';
		node.checked = this.isChecked;

		node.addEventListener( 'change', handleDomEvent, false );

		// in case of IE emergency, bind to click event as well
		if ( node.attachEvent ) {
			node.addEventListener( 'click', handleDomEvent, false );
		}
	}

	unbind () {
		removeFromArray( this.siblings, this );
	}

	unrender () {
		var node = this.element.node;

		node.removeEventListener( 'change', handleDomEvent, false );
		node.removeEventListener( 'click', handleDomEvent, false );
	}
}
