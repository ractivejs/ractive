import { html } from '../../../../config/namespaces';
import { safeToStringValue, camelize } from '../../../../utils/dom';
import { arrayContains } from '../../../../utils/array';
import { isArray } from '../../../../utils/is';
import noop from '../../../../utils/noop';
import { readStyle, readClass } from '../../../helpers/specialAttrs';
import { xmlns } from '../../../../config/namespaces';

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
				return;
			}
		}

		this.node.selectedIndex = -1;
	}
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
	if ( !this.locked ) {
		const value = this.getValue();

		this.node.value = this.node._ractive.value = value;
		this.node.setAttribute( 'value', value );
	}
}

function updateStringValue () {
	if ( !this.locked ) {
		const value = this.getValue();

		this.node._ractive.value = value;

		this.node.value = safeToStringValue( value );
		this.node.setAttribute( 'value', safeToStringValue( value ) );
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

function updateStyleAttribute () {
	const props = readStyle( this.getValue() || '' );
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

function updateInlineStyle () {
	if ( !this.styleName ) {
		this.styleName = camelize( this.name.substr( 6 ) );
	}

	this.node.style[ this.styleName ] = this.getValue();
}

function updateClassName () {
	const value = readClass( safeToStringValue( this.getValue() ) );
	const attr = readClass( this.node.className );
	const prev = this.previous || attr.slice( 0 );

	// TODO: if/when conditional attrs land, avoid this by shifting class attrs to the front
	if ( !this.directives ) {
		this.directives = this.element.attributes.filter( a => a.name.substr( 0, 6 ) === 'class-' );
	}
	value.push.apply( value, this.directives.map( d => d.inlineClass ) );

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

	const className = attr.join( ' ' );

	if ( className !== this.node.className ) {
		this.node.className = className;
	}

	this.previous = value;
}

function updateInlineClass () {
	const name = this.name.substr( 6 );
	const attr = readClass( this.node.className );
	const value = this.getValue();

	if ( !this.inlineClass ) this.inlineClass = name;

	if ( value && !~attr.indexOf( name ) ) attr.push( name );
	else if ( !value && ~attr.indexOf( name ) ) attr.splice( attr.indexOf( name ), 1 );

	this.node.className = attr.join( ' ' );
}

function updateBoolean () {
	// with two-way binding, only update if the change wasn't initiated by the user
	// otherwise the cursor will often be sent to the wrong place
	if ( !this.locked ) {
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

function updateAttribute () {
	this.node.setAttribute( this.name, safeToStringValue( this.getString() ) );
}

function updateNamespacedAttribute () {
	// don't output xmlns attrs
	if ( this.namespace !== xmlns ) {
		this.node.setAttributeNS( this.namespace, this.name.slice( this.name.indexOf( ':' ) + 1 ), safeToStringValue( this.getString() ) );
	}
}
