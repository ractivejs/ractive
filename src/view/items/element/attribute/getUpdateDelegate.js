import { html } from 'config/namespaces';
import { booleanAttributes } from 'utils/html';
import { safeToStringValue } from 'utils/dom';
import { arrayContains } from 'utils/array';
import { isArray } from 'utils/is';
import noop from 'utils/noop';

export default function getUpdateDelegate ( attribute ) {
	const { element, name } = attribute;

	if ( name === 'id' ) return updateId;

	if ( name === 'value' ) {
		// special case - selects
		if ( element.name === 'select' && name === 'value' ) {
			return element.getAttribute( 'multiple' ) ? updateMultipleSelectValue : updateSelectValue;
		}

		if ( element.name === 'textarea' ) return updateValue;

		// special case - contenteditable
		if ( element.getAttribute( 'contenteditable' ) != null ) return updateContentEditableValue;

		// special case - <input>
		if ( element.name === 'input' ) {
			const type = element.getAttribute( 'type' );

			// type='file' value='{{fileList}}'>
			if ( type === 'file' ) return noop; // read-only

			// type='radio' name='{{twoway}}'
			if ( type === 'radio' && element.binding && element.binding.name === 'name' ) return updateRadioValue;
		}

		return updateValue;
	}

	const node = element.node;

	// special case - <input type='radio' name='{{twoway}}' value='foo'>
	if ( attribute.isTwoway && name === 'name' ) {
		if ( node.type === 'radio' ) return updateRadioName;
		if ( node.type === 'checkbox' ) return updateCheckboxName;
	}

	// special case - style attributes in Internet Exploder
	if ( name === 'style' && node.style.setAttribute ) return updateIEStyleAttribute;

	// special case - class names. IE fucks things up, again
	if ( name === 'class' && ( !node.namespaceURI || node.namespaceURI === html ) ) return updateClassName;

	if ( attribute.useProperty ) return updateProperty;

	return updateAttribute;
}

function updateId () {
	const { node } = this;
	const value = this.getValue();

	delete this.ractive.nodes[ node.id ];
	this.ractive.nodes[ value ] = node;

	node.id = value;
}

function updateMultipleSelectValue () {
	let value = this.getValue();

	if ( !isArray( value ) ) value = [ value ];

	const options = this.node.options;
	let i = options.length;

	while ( i-- ) {
		const option = options[i];
		const optionValue = option._ractive ?
			option._ractive.value :
			option.value; // options inserted via a triple don't have _ractive

		option.selected = arrayContains( value, optionValue );
	}
}

function updateSelectValue () {
	const value = this.getValue();

	if ( !this.locked ) { // TODO is locked still a thing?
		this.node._ractive.value = value;

		const options = this.node.options;
		let i = options.length;

		while ( i-- ) {
			const option = options[i];
			const optionValue = option._ractive ?
				option._ractive.value :
				option.value; // options inserted via a triple don't have _ractive

			if ( optionValue == value ) { // double equals as we may be comparing numbers with strings
				option.selected = true;
				break;
			}
		}
	}

	// if we're still here, it means the new value didn't match any of the options...
	// TODO figure out what to do in this situation
}


function updateContentEditableValue () {
	const value = this.getValue();

	if ( !this.locked ) {
		this.node.innerHTML = value === undefined ? '' : value;
	}
}

function updateRadioValue () {
	const node = this.node;
	const wasChecked = node.checked;

	node.value = this.element.getAttribute( 'value' );
	node.checked = this.element.getAttribute( 'value' ) === this.element.getAttribute( 'name' );

	// TODO does the below still apply?

	// This is a special case - if the input was checked, and the value
	// changed so that it's no longer checked, the twoway binding is
	// most likely out of date. To fix it we have to jump through some
	// hoops... this is a little kludgy but it works
	// if ( wasChecked && !node.checked && this.element.binding ) {
	// 	const bindings = this.element.binding.siblings;
	// 	let i = bindings.length;
	//
	// 	if ( i ) {
	// 		let binding;
	//
	// 		while ( i-- ) {
	// 			binding = bindings[i];
	//
	// 			if ( !binding.element.node ) {
	// 				// this is the initial render, siblings are still rendering!
	// 				// we'll come back later...
	// 				return;
	// 			}
	//
	// 			if ( binding.element.node.checked ) {
	// 				runloop.addRactive( binding.ractive );
	// 				return binding.handleChange();
	// 			}
	// 		}
	//
	// 		binding.model.set( undefined );
	// 	}
	// }
}

function updateValue () {
	if ( !this.locked ) {
		this.node.value = this.node._ractive.value = this.getValue();
	}
}

function updateRadioName () {
	this.node.checked = ( this.getValue() == this.node._ractive.value );
}

function updateCheckboxName () {
	const { element, node } = this;
	const binding = element.binding;

	const value = this.getValue();
	const valueAttribute = element.getAttribute( 'value' );

	if ( !isArray( value ) ) {
		binding.isChecked = node.checked = ( value == valueAttribute );
	} else {
		let i = value.length;
		while ( i-- ) {
			if ( valueAttribute == value[i] ) {
				binding.isChecked = node.checked = true;
				return;
			}
		}
		binding.isChecked = node.checked = false;
	}
}

function updateIEStyleAttribute () {
	this.node.style.setAttribute( 'cssText', this.getValue() || '' );
}

function updateClassName () {
	this.node.className = safeToStringValue( this.getValue() );
}

function updateProperty () {
	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		this.node[ this.propertyName ] = this.getValue();
	}
}

function updateAttribute () {
	this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
}
