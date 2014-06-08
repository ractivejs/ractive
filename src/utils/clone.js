import isArray from 'utils/isArray';

export default function ( source ) {
	var target, key;

	if ( !source || typeof source !== 'object'
				 // don't get punk'd by js "wat?" ;)
				 || source instanceof Date
				 || source instanceof Boolean
				 || source instanceof Number
				 || source instanceof String ) {

		return source;
	}

	if ( isArray( source ) ) {
		return source.slice();
	}

	target = {};

	for ( key in source ) {
		if ( source.hasOwnProperty( key ) ) {
			target[ key ] = source[ key ];
		}
	}

	return target;
}
