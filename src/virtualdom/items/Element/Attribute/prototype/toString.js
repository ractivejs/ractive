import booleanAttributes from 'config/booleanAttributes';
import namespaces from 'config/namespaces';

export default function Attribute$toString () {
	var { name, namespace, value, interpolator, fragment } = this;

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
		return 'name={{' + ( interpolator.keypath || interpolator.ref ) + '}}';
	}

	// Boolean attributes
	if ( booleanAttributes.test( name ) ) {
		return value ? name : '';
	}

	if ( fragment ) {
		value = fragment.toString();
	}

	if ( namespace ) {
		name = findKey(namespaces, namespace) + ':' + name;
	}

	return value ? name + '="' + escape( value ) + '"' : name;
}

function findKey(object, value) {
	var key;

	for ( key in object ) {
		if ( object[key] === value ) {
			return key;
		}
	}

	return null;
}

function escape ( value ) {
	return value
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}
