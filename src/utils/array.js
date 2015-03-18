import { isArray } from 'utils/is';

export function addToArray ( array, value ) {
	var index = array.indexOf( value );

	if ( index === -1 ) {
		array.push( value );
	}
}

export function arrayContains ( array, value ) {
	for ( let i = 0, c = array.length; i < c; i++ ) {
		if ( array[i] == value ) {
			return true;
		}
	}

    return false;
}

export function arrayContentsMatch ( a, b ) {
	var i;

	if ( !isArray( a ) || !isArray( b ) ) {
		return false;
	}

	if ( a.length !== b.length ) {
		return false;
	}

	i = a.length;
	while ( i-- ) {
		if ( a[i] !== b[i] ) {
			return false;
		}
	}

	return true;
}

export function ensureArray ( x ) {
	if ( typeof x === 'string' ) {
		return [ x ];
	}

	if ( x === undefined ) {
		return [];
	}

	return x;
}

export function lastItem ( array ) {
	return array[ array.length - 1 ];
}

export function removeFromArray ( array, member ) {
	var index = array.indexOf( member );

	if ( index !== -1 ) {
		array.splice( index, 1 );
	}
}

export function toArray ( arrayLike ) {
	var array = [], i = arrayLike.length;
	while ( i-- ) {
		array[i] = arrayLike[i];
	}

	return array;
}
