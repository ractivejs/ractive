var toString = Object.prototype.toString,
	arrayLikePattern = /^\[object (?:Array|FileList)\]$/;

// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
export function isArray ( thing ) {
	return toString.call( thing ) === '[object Array]';
}

export function isArrayLike ( obj ) {
	return arrayLikePattern.test( toString.call( obj ) );
}

export function isEmptyObject ( obj ) {
	// if it's not an object, it's not an empty object
	if ( !isObject( obj ) ) {
		return false;
	}

	for ( var k in obj ) {
		if ( obj.hasOwnProperty( k ) ) return false;
	}

	return true;
}

export function isEqual ( a, b ) {
	if ( a === null && b === null ) {
		return true;
	}

	if ( typeof a === 'object' || typeof b === 'object' ) {
		return false;
	}

	return a === b;
}

export function isNumber ( thing ) {
	return ( typeof thing  === 'number' || (typeof thing === 'object' && toString.call( thing ) === '[object Number]') );
}

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
export function isNumeric ( thing ) {
	return !isNaN( parseFloat( thing ) ) && isFinite( thing );
}

export function isObject ( thing ) {
	return ( thing && toString.call( thing ) === '[object Object]' );
}
