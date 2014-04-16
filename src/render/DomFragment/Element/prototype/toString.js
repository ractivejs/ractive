define([
	'config/voidElementNames',
	'utils/isArray'
], function (
	voidElementNames,
	isArray
) {

	'use strict';

	return function () {
		var str, i, len, attrStr;

		str = '<' + ( this.descriptor.y ? '!doctype' : this.descriptor.e );

		len = this.attributes.length;
		for ( i=0; i<len; i+=1 ) {
			if ( attrStr = this.attributes[i].toString() ) {
				str += ' ' + attrStr;
			}
		}

		// Special case - selected options
		if ( this.lcName === 'option' && optionIsSelected( this ) ) {
			str += ' selected';
		}

		// Special case - two-way radio name bindings
		if ( this.lcName === 'input' && inputIsCheckedRadio( this ) ) {
			str += ' checked';
		}

		str += '>';

		if ( this.fragment ) {
			str += this.fragment.toString();
		}

		// add a closing tag if this isn't a void element
		if ( voidElementNames.indexOf( this.descriptor.e ) === -1 ) {
			str += '</' + this.descriptor.e + '>';
		}

		this.stringifying = false;
		return str;
	};


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

});
