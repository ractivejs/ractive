import { safeToStringValue } from 'utils/dom';
import { isArray } from 'utils/is';

export default function getUpdateDelegate ( attribute ) {
	const { element, name, template } = attribute;

	if ( name === 'id' ) {
		return updateId;
	}

	if ( name === 'value' ) {
		if ( element.getAttribute( 'contenteditable' ) != null ) return updateContentEditableValue;
		// TODO more...

		return updateValue;
	}

	const node = element.node;

	// TODO temp
	if ( name === 'checked' ) return setProperty;

	// TODO only if two-way binding?
	if ( name === 'name' ) {
		if ( node.type === 'radio' ) {
			return setProperty;
			//return updateRadioName;
		}

		if ( node.type === 'checkbox' ) {
			return updateCheckboxName;
		}
	}

	if ( typeof template === 'boolean' ) return setProperty;
	if ( typeof template === 'string' ) return setAttribute;

	// TODO all the other finicky types

	return setAttribute;
}

function updateId () {
	const { node } = this;
	const value = this.getValue();

	this.ractive.nodes[ value ] = node;
	node.id = value;
}

function updateContentEditableValue () {
	const value = this.getValue();

	if ( !this.locked ) {
		this.node.innerHTML = value === undefined ? '' : value;
	}
}

function updateValue () {
	this.node.value = this.node._ractive.value = this.getValue();
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

function setProperty () {
	this.node[ this.name ] = this.getValue();
}

function setAttribute () {
	this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
}
