var truthy = /^true|on|yes|1$/i;
var isNumeric = /^[0-9]+$/;

export default function( element, attributes ) {
	var val;

	// attributes that are present but don't have a value (=)
	// will be set to the number 0, which we condider to be true
	// the string '0', however is false

	val = attributes.twoway;
	if ( val !== undefined ) {
		element.twoway = val === 0 || truthy.test( val );
		delete attributes.twoway;
	}

	val = attributes.lazy;
	if ( val !== undefined ) {
		// check for timeout value
		if ( val !== 0 && isNumeric.test( val ) ) {
			element.lazy = parseInt( val );
		} else {
			element.lazy = val === 0 || truthy.test( val );
		}
		delete attributes.lazy;
	}
}
