import { html } from '../../../../config/namespaces';
import { safeToStringValue } from '../../../../utils/dom';
import { arrayContains } from '../../../../utils/array';
import { isArray } from '../../../../utils/is';
import noop from '../../../../utils/noop';

const textTypes = [ undefined, 'text', 'search', 'url', 'email', 'hidden', 'password', 'search', 'reset', 'submit' ];

export default function getUpdateDelegate ( attribute ) {
	const { element, name } = attribute;

	if ( name === 'id' ) return updateId;

	if ( name === 'value' ) {
		// special case - selects
		if ( element.name === 'select' && name === 'value' ) {
			return element.getAttribute( 'multiple' ) ? updateMultipleSelectValue : updateSelectValue;
		}

		if ( element.name === 'textarea' ) return updateStringValue;

		// special case - contenteditable
		if ( element.getAttribute( 'contenteditable' ) != null ) return updateContentEditableValue;

		// special case - <input>
		if ( element.name === 'input' ) {
			const type = element.getAttribute( 'type' );

			// type='file' value='{{fileList}}'>
			if ( type === 'file' ) return noop; // read-only

			// type='radio' name='{{twoway}}'
			if ( type === 'radio' && element.binding && element.binding.attribute.name === 'name' ) return updateRadioValue;

			if ( ~textTypes.indexOf( type ) ) return updateStringValue;
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

	if ( attribute.isBoolean ) return updateBoolean;

	if ( attribute.namespace && attribute.namespace !== attribute.node.namespaceURI ) return updateNamespacedAttribute;

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

	// if we're still here, it means the new value didn't match any of the options...
	// TODO figure out what to do in this situation
}


function updateContentEditableValue () {
	const value = this.getValue();

	this.node.innerHTML = value === undefined ? '' : value;
}

function updateRadioValue () {
	const node = this.node;
	const wasChecked = node.checked;

	const value = this.getValue();

	//node.value = this.element.getAttribute( 'value' );
	node.value = this.node._ractive.value = value;
	node.checked = value === this.element.getAttribute( 'name' );

	// This is a special case - if the input was checked, and the value
	// changed so that it's no longer checked, the twoway binding is
	// most likely out of date. To fix it we have to jump through some
	// hoops... this is a little kludgy but it works
	if ( wasChecked && !node.checked && this.element.binding && this.element.binding.rendered ) {
		this.element.binding.group.model.set( this.element.binding.group.getValue() );
	}
}

function updateValue () {
	const value = this.getValue();

	this.node.value = this.node._ractive.value = value;
	this.node.setAttribute( 'value', value );
}

function updateStringValue () {
	let value = this.getValue();

	this.node._ractive.value = value;

	value = safeToStringValue( value );

	if ( this.node.value !== value ) {
		this.node.value = value;
	}

	if ( this.node.getAttribute( 'value' ) !== value ) {
		this.node.setAttribute( 'value', value );
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

function updateBoolean () {
	if ( this.useProperty ) {
		this.node[ this.propertyName ] = this.getValue();
	} else {
		if ( this.getValue() ) {
			this.node.setAttribute( this.propertyName, '' );
		} else {
			this.node.removeAttribute( this.propertyName );
		}
	}
}

function updateAttribute () {
	this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
}

function updateNamespacedAttribute () {
	this.node.setAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ), safeToStringValue( this.getString() ) );
}
