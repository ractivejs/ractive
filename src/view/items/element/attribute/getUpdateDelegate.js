import { html } from '../../../../config/namespaces';
import { safeToStringValue } from '../../../../utils/dom';
import { arrayContains } from '../../../../utils/array';
import { isArray } from '../../../../utils/is';
import noop from '../../../../utils/noop';
import { readStyle, readClass } from '../../../helpers/specialAttrs';

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

	if ( name === 'style' ) return updateStyleAttribute;

	if ( name.indexOf( 'style-' ) === 0 ) return updateInlineStyle;

	// special case - class names. IE fucks things up, again
	if ( name === 'class' && ( !node.namespaceURI || node.namespaceURI === html ) ) return updateClassName;

	if ( name.indexOf( 'class-' ) === 0 ) return updateInlineClass;

	if ( attribute.isBoolean ) return updateBoolean;

	if ( attribute.namespace && attribute.namespace !== attribute.node.namespaceURI ) return updateNamespacedAttribute;

	return updateAttribute;
}

function updateId ( reset ) {
	const { node } = this;
	const value = this.getValue();

	// remove the mapping to this node if it hasn't already been replaced
	if ( this.ractive.nodes[ node.id ] === node ) delete this.ractive.nodes[ node.id ];
	if ( reset ) return node.removeAttribute( 'id' );

	this.ractive.nodes[ value ] = node;

	node.id = value;
}

function updateMultipleSelectValue ( reset ) {
	let value = this.getValue();

	if ( !isArray( value ) ) value = [ value ];

	const options = this.node.options;
	let i = options.length;

	if ( reset ) {
		while ( i-- ) options[i].selected = false;
	} else {
		while ( i-- ) {
			const option = options[i];
			const optionValue = option._ractive ?
				option._ractive.value :
				option.value; // options inserted via a triple don't have _ractive

			option.selected = arrayContains( value, optionValue );
		}
	}
}

function updateSelectValue ( reset ) {
	const value = this.getValue();

	if ( !this.locked ) { // TODO is locked still a thing?
		this.node._ractive.value = value;

		const options = this.node.options;
		let i = options.length;
		let wasSelected = false;

		if ( reset ) {
			while ( i-- ) options[i].selected = false;
		} else {
			while ( i-- ) {
				const option = options[i];
				const optionValue = option._ractive ?
					option._ractive.value :
					option.value; // options inserted via a triple don't have _ractive
				if ( option.disabled && option.selected ) wasSelected = true;

				if ( optionValue == value ) { // double equals as we may be comparing numbers with strings
					option.selected = true;
					return;
				}
			}
		}

		if ( !wasSelected ) this.node.selectedIndex = -1;
	}
}


function updateContentEditableValue ( reset ) {
	const value = this.getValue();

	if ( !this.locked ) {
		if ( reset ) this.node.innerHTML = '';
		else this.node.innerHTML = value === undefined ? '' : value;
	}
}

function updateRadioValue ( reset ) {
	const node = this.node;
	const wasChecked = node.checked;

	const value = this.getValue();

	if ( reset ) return node.checked = false;

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

function updateValue ( reset ) {
	if ( !this.locked ) {
		if ( reset ) {
			this.node.removeAttribute( 'value' );
			this.node.value = this.node._ractive.value = null;
			return;
		}

		const value = this.getValue();

		this.node.value = this.node._ractive.value = value;
		this.node.setAttribute( 'value', value );
	}
}

function updateStringValue ( reset ) {
	if ( !this.locked ) {
		if ( reset ) {
			this.node._ractive.value = '';
			this.node.removeAttribute( 'value' );
			return;
		}

		const value = this.getValue();

		this.node._ractive.value = value;

		this.node.value = safeToStringValue( value );
		this.node.setAttribute( 'value', safeToStringValue( value ) );
	}
}

function updateRadioName ( reset ) {
	if ( reset ) this.node.checked = false;
	else this.node.checked = ( this.getValue() == this.node._ractive.value );
}

function updateCheckboxName ( reset ) {
	const { element, node } = this;
	const binding = element.binding;

	const value = this.getValue();
	const valueAttribute = element.getAttribute( 'value' );

	if ( reset ) {
		// TODO: WAT?
	}

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

function updateStyleAttribute ( reset ) {
	const props = reset ? {} : readStyle( this.getValue() || '' );
	const style = this.node.style;
	const keys = Object.keys( props );
	const prev = this.previous || [];

	let i = 0;
	while ( i < keys.length ) {
		if ( keys[i] in style ) style[ keys[i] ] = props[ keys[i] ];
		i++;
	}

	// remove now-missing attrs
	i = prev.length;
	while ( i-- ) {
		if ( !~keys.indexOf( prev[i] ) && prev[i] in style ) style[ prev[i] ] = '';
	}

	this.previous = keys;
}

const camelize = /(-.)/g;
function updateInlineStyle ( reset ) {
	if ( !this.styleName ) {
		this.styleName = this.name.substr( 6 ).replace( camelize, s => s.charAt( 1 ).toUpperCase() );
	}

	this.node.style[ this.styleName ] = reset ? '' : this.getValue();
}

function updateClassName ( reset ) {
	const value = reset ? [] : readClass( safeToStringValue( this.getValue() ) );
	const attr = readClass( this.node.className );
	const prev = this.previous || [];

	let i = 0;
	while ( i < value.length ) {
		if ( !~attr.indexOf( value[i] ) ) attr.push( value[i] );
		i++;
	}

	// remove now-missing classes
	i = prev.length;
	while ( i-- ) {
		if ( !~value.indexOf( prev[i] ) ) {
			const idx = attr.indexOf( prev[i] );
			if ( ~idx ) attr.splice( idx, 1 );
		}
	}

	this.node.className = attr.join( ' ' );

	this.previous = value;
}

function updateInlineClass ( reset ) {
	const name = this.name.substr( 6 );
	const attr = readClass( this.node.className );
	const value = reset ? false : this.getValue();

	if ( value && !~attr.indexOf( name ) ) attr.push( name );
	else if ( !value && ~attr.indexOf( name ) ) attr.splice( attr.indexOf( name ), 1 );

	this.node.className = attr.join( ' ' );
}

function updateBoolean ( reset ) {
	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
		if ( reset ) {
			if ( this.useProperty ) this.node[ this.propertyName ] = false;
			this.node.removeAttribute( this.propertyName );
			return;
		}

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
}

function updateAttribute ( reset ) {
	if ( reset ) this.node.removeAttribute( this.name );
	else this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
}

function updateNamespacedAttribute ( reset ) {
	if ( reset ) this.node.removeAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ) );
	else this.node.setAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ), safeToStringValue( this.getString() ) );
}
