import { escapeHtml, voidElementNames } from 'utils/html';
import { isArray } from 'utils/is';

export default function () {
	var str, escape;

	if ( this.template.y ) {
		// DOCTYPE declaration
		return '<!DOCTYPE' + this.template.dd + '>';
	}

	str = '<' + this.template.e;

	str += this.attributes.map( stringifyAttribute ).join( '' )
	     + this.conditionalAttributes.map( stringifyAttribute ).join( '' );

	// Special case - selected options
	if ( this.name === 'option' && optionIsSelected( this ) ) {
		str += ' selected';
	}

	// Special case - two-way radio name bindings
	if ( this.name === 'input' && inputIsCheckedRadio( this ) ) {
		str += ' checked';
	}

	str += '>';

	// Special case - textarea
	if ( this.name === 'textarea' && this.getAttribute( 'value' ) !== undefined ) {
		str += escapeHtml( this.getAttribute( 'value' ) );
	}

	// Special case - contenteditable
	else if ( this.getAttribute( 'contenteditable' ) !== undefined ) {
		str += this.getAttribute( 'value' );
	}

	if ( this.fragment ) {
		escape = ( this.name !== 'script' && this.name !== 'style' );
		str += this.fragment.toString( escape );
	}

	// add a closing tag if this isn't a void element
	if ( !voidElementNames.test( this.template.e ) ) {
		str += '</' + this.template.e + '>';
	}

	return str;
}

function optionIsSelected ( element ) {
	var optionValue, selectValue, i;

	optionValue = element.getAttribute( 'value' );

	if ( optionValue === undefined || !element.select ) {
		return false;
	}

	selectValue = element.select.getAttribute( 'value' );

	if ( selectValue == optionValue ) {
		return true;
	}

	if ( element.select.getAttribute( 'multiple' ) && isArray( selectValue ) ) {
		i = selectValue.length;
		while ( i-- ) {
			if ( selectValue[i] == optionValue ) {
				return true;
			}
		}
	}
}

function inputIsCheckedRadio ( element ) {
	var attributes, typeAttribute, valueAttribute, nameAttribute;

	attributes = element.attributes;

	typeAttribute  = attributes.type;
	valueAttribute = attributes.value;
	nameAttribute  = attributes.name;

	if ( !typeAttribute || ( typeAttribute.value !== 'radio' ) || !valueAttribute || !nameAttribute.interpolator ) {
		return;
	}

	if ( valueAttribute.value === nameAttribute.interpolator.value ) {
		return true;
	}
}

function stringifyAttribute ( attribute ) {
	var str = attribute.toString();
	return str ? ' ' + str : '';
}
