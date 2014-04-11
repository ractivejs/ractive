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

		if ( this.html ) {
			str += this.html;
		} else if ( this.fragment ) {
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
		var optionValue, selectValueInterpolator, selectValue, i;

		selectValueInterpolator = getInterpolator(element.select);
		if ( !selectValueInterpolator ) {
			return;
		}

		selectValue = getValueAttributeFrom( selectValueInterpolator, element.select.root );

		if ( selectValue == getValueAttribute( element ) ) {
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

	function getValueAttribute ( element ) {
		return getValueAttributeFrom( getInterpolator( element ), element.root );
	}
	function getInterpolator ( element ) {
		return element.attributes.value.interpolator;
	}
	function getValueAttributeFrom ( interpolator, root ) {
		return root.get( interpolator.keypath || interpolator.ref );
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
