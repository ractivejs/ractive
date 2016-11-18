import { isArray } from './is';

export function addToArray ( array, value ) {
	const index = array.indexOf( value );

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
	let i;

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
	if ( !array ) {
		return;
	}

	const index = array.indexOf( member );

	if ( index !== -1 ) {
		array.splice( index, 1 );
	}
}

export function combine ( first, ...rest ) {
	const res = first.slice();
	rest = rest.concat.apply( [], rest );

	let i = rest.length;
	while ( i-- ) {
		if ( !~res.indexOf( rest[i] ) ) {
			res.push( rest[i] );
		}
	}

	return res;
}

export function toArray ( arrayLike ) {
	const array = [];
	let i = arrayLike.length;
	while ( i-- ) {
		array[i] = arrayLike[i];
	}

	return array;
}

export function find ( array, fn ) {
	const len = array.length;
	for ( let i = 0; i < len; i++ ) {
		if ( fn( array[i] ) ) return array[i];
	}
}

export function findMap ( array, fn ) {
	const len = array.length;
	for ( let i = 0; i < len; i++ ) {
		const result = fn( array[i] );
		if ( result ) return result;
	}
}
