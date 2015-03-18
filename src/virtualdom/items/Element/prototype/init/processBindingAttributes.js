var truthy = /^true|on|yes|1$/i;
var isNumeric = /^[0-9]+$/;

export default function( element, template ) {
	var val, attrs, attributes;

	attributes = template.a || {};
	attrs = {};

	// attributes that are present but don't have a value (=)
	// will be set to the number 0, which we condider to be true
	// the string '0', however is false

	val = attributes.twoway;
	if ( val !== undefined ) {
		attrs.twoway = val === 0 || truthy.test( val );
	}

	val = attributes.lazy;
	if ( val !== undefined ) {
		// check for timeout value
		if ( val !== 0 && isNumeric.test( val ) ) {
			attrs.lazy = parseInt( val );
		} else {
			attrs.lazy = val === 0 || truthy.test( val );
		}
	}

	return attrs;
}
