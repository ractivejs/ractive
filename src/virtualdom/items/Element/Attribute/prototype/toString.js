import booleanAttributes from 'config/booleanAttributes';

export default function Attribute$toString () {
	var name, value, interpolator;

	name = this.name;
	value = this.value;

	// Special case - select values (should not be stringified)
	if ( name === 'value' && this.element.name === 'select' ) {
		return;
	}

	// Special case - radio names
	if ( name === 'name' && this.element.name === 'input' && ( interpolator = this.interpolator ) ) {
		return 'name={{' + ( interpolator.keypath || interpolator.ref ) + '}}';
	}

	// Boolean attributes
	if ( booleanAttributes.test( name ) ) {
		return value ? name : '';
	}

	// Strings
	if ( typeof value === 'string' ) {
		return value ? name + '="' + escape( value ) + '"' : name;
	}

	// Everything else
	return name + '="' + value + '"';
}

function escape ( value ) {
	return value
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}
