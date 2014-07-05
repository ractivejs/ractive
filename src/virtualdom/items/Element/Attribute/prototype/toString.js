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

	// Numbers
	if ( typeof value === 'number' ) {
		return name + '="' + value + '"';
	}

	// Strings
	if ( typeof value === 'string' ) {
		return name + '="' + escape( value ) + '"';
	}

	// Everything else
	return value ? name : '';
}

function escape ( value ) {
	return value
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}
