import isObject from 'utils/isObject';

export default function( obj ) {
	// if it's not an object, it's not an empty object
	if ( !isObject( obj ) ) {
		return false;
	}

	for ( var k in obj ) {
		if ( obj.hasOwnProperty( k ) ) return false;
	}

	return true;
}
