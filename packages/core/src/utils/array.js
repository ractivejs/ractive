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

	if ( !Array.isArray( a ) || !Array.isArray( b ) ) {
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

export function combine ( ...arrays ) {
	const res = arrays.concat.apply( [], arrays );
	let i = res.length;
	while ( i-- ) {
		const idx = res.indexOf( res[i] );
		if ( ~idx && idx < i ) res.splice( i, 1 );
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

export function findMap ( array, fn ) {
	const len = array.length;
	for ( let i = 0; i < len; i++ ) {
		const result = fn( array[i] );
		if ( result ) return result;
	}
}
