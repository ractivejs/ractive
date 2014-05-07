// via https://github.com/kangax/html-minifier/issues/63#issuecomment-37763316
var booleanAttributes = /allowFullscreen|async|autofocus|autoplay|checked|compact|controls|declare|default|defaultChecked|defaultMuted|defaultSelected|defer|disabled|draggable|enabled|formNoValidate|hidden|indeterminate|inert|isMap|itemScope|loop|multiple|muted|noHref|noResize|noShade|noValidate|noWrap|open|pauseOnExit|readOnly|required|reversed|scoped|seamless|selected|sortable|spellcheck|translate|trueSpeed|typeMustMatch|visible/;

export default function Attribute$toString () {
	var escaped, interpolator;

	if ( this.value === null ) {
		return this.name;
	}

	// Special case - select values (should not be stringified)
	if ( this.name === 'value' && this.element.lcName === 'select' ) {
		return;
	}

	// Special case - radio names
	if ( this.name === 'name' && this.element.lcName === 'input' && ( interpolator = this.interpolator ) ) {
		return 'name={{' + ( interpolator.keypath || interpolator.ref ) + '}}';
	}

	// Special case - boolean attributes
	if ( this.fragment && booleanAttributes.test( this.name ) ) {
		return this.fragment.getValue() ? this.name : null;
	}

	if ( this.fragment ) {
		escaped = escape( this.fragment.toString() );
	} else {
		escaped = escape( this.value );
	}

	return this.name + ( escaped ? ( '="' + escaped + '"' ) : '' );
}

function escape ( string ) {
	return string
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' );
}
