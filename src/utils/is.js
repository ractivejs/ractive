const toString = Object.prototype.toString;
const arrayLikePattern = /^\[object (?:Array|FileList)\]$/;

// thanks, http://perfectionkills.com/instanceof-considered-harmful-or-how-to-write-a-robust-isarray/
export function isArray ( thing ) {
	return toString.call( thing ) === '[object Array]';
}

export function isArrayLike ( obj ) {
	return arrayLikePattern.test( toString.call( obj ) );
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

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
export function isNumeric ( thing ) {
	return !isNaN( parseFloat( thing ) ) && isFinite( thing );
}

export function isObject ( thing ) {
	return ( thing && toString.call( thing ) === '[object Object]' );
}

export function isObjectLike ( thing ) {
	if ( !thing ) return false;
	const type = typeof thing;
	if ( type === 'object' || type === 'function' ) return true;
}

export function isNotAnElement ( name ){
	return document.createElement( name ).constructor === HTMLUnknownElement;
}
