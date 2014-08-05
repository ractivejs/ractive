import booleanAttributes from 'config/booleanAttributes';

export default function Attribute$toString () {
	var { name, value, interpolator, fragment } = this;

	// Special case - select values (should not be stringified)
	if ( name === 'value' && this.element.name === 'select' ) {
		return;
	}

	// Special case - content editable
	if ( name === 'value' && this.element.getAttribute( 'contenteditable' ) !== undefined ) {
		return;
	}

	// Special case - radio names
	if ( name === 'name' && this.element.name === 'input' && interpolator ) {
		return 'name={{' + ( interpolator.keypath || interpolator.ref ) + '}}';
	}

	// Boolean attributes
	if ( booleanAttributes.test( name ) ) {
		return value ? name : '';
	}

	if ( fragment ) {
		value = fragment.toString();
	}

	return value ? name + '="' + escape( value ) + '"' : name;
}

function escape ( value ) {
	return value
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}
