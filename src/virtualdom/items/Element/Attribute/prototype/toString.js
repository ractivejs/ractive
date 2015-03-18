export default function Attribute$toString () {
	var { name, namespacePrefix, value, interpolator, fragment } = this;

	// Special case - select and textarea values (should not be stringified)
	if ( name === 'value' && ( this.element.name === 'select' || this.element.name === 'textarea' ) ) {
		return;
	}

	// Special case - content editable
	if ( name === 'value' && this.element.getAttribute( 'contenteditable' ) !== undefined ) {
		return;
	}

	// Special case - radio names
	if ( name === 'name' && this.element.name === 'input' && interpolator ) {
		return 'name={{' + ( interpolator.keypath.getKeypath() || interpolator.ref ) + '}}';
	}

	// Boolean attributes
	if ( this.isBoolean ) {
		return value ? name : '';
	}

	if ( fragment ) {
		// special case - this catches undefined/null values (#1211)
		if ( fragment.items.length === 1 && fragment.items[0].value == null ) {
			return '';
		}

		value = fragment.toString();
	}

	if ( namespacePrefix ) {
		name = namespacePrefix + ':' + name;
	}

	return value ? name + '="' + escape( value ) + '"' : name;
}

function escape ( value ) {
	return value
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}
