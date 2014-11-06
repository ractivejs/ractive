var truthy = /^true|on|yes|1$/i;
var isNumeric = /^[0-9]+$/;

export default function( element, attributes ) {
	var val;

	val = attributes.twoway;
	if ( val !== undefined ) {
		element.twoway = truthy.test( val );
		delete attributes.twoway;
	}

	val = attributes.lazy;
	if ( val !== undefined ) {
		if ( isNumeric.test( val ) ) {
			element.lazy = parseInt( val );
		} else {
			element.lazy = truthy.test( val );
		}
		delete attributes.lazy;
	}
}
