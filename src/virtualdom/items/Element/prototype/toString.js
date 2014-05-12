import voidElementNames from 'config/voidElementNames';
import isArray from 'utils/isArray';

export default function () {
	var str, escape;

	str = '<' + ( this.template.y ? '!doctype' : this.template.e );

	str += this.attributes.map( stringifyAttribute ).join( '' );

	// Special case - selected options
	if ( this.name === 'option' && optionIsSelected( this ) ) {
		str += ' selected';
	}

	// Special case - two-way radio name bindings
	if ( this.name === 'input' && inputIsCheckedRadio( this ) ) {
		str += ' checked';
	}

	str += '>';

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
	var optionValue, optionValueAttribute, optionValueInterpolator,
		selectValueAttribute, selectValueInterpolator,
		selectValue, i;

	optionValueAttribute = element.attributes.value;

	if(optionValueAttribute.value){
		optionValue = optionValueAttribute.value;
	} else {
		optionValueInterpolator = optionValueAttribute.interpolator;
		if( !optionValueInterpolator ) {
			return;
		}
		optionValue = element.root.get( optionValueInterpolator.keypath || optionValueInterpolator.ref );
	}

	selectValueAttribute = element.select.attributes.value;
	selectValueInterpolator = selectValueAttribute.interpolator;

	if ( !selectValueInterpolator ) {
		return;
	}

	selectValue = element.root.get( selectValueInterpolator.keypath || selectValueInterpolator.ref );

	if ( selectValue == optionValue ) {
		return true;
	}

	if ( element.select.attributes.multiple && isArray( selectValue ) ) {
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
