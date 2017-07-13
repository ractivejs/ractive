import { splitKeypath } from '../shared/keypaths';
import { isObjectLike } from './is';

export function fillGaps ( target, ...sources ) {

	for (let i = 0; i < sources.length; i++){
		const source = sources[i];
		for ( const key in source ) {
			// Source can be a prototype-less object.
			if ( key in target || !Object.prototype.hasOwnProperty.call( source, key ) ) continue;
			target[ key ] = source[ key ];
		}
	}

	return target;
}

export function toPairs ( obj = {} ) {
	const pairs = [];
	for ( const key in obj ) {
		// Source can be a prototype-less object.
		if ( !Object.prototype.hasOwnProperty.call( obj, key ) ) continue;
		pairs.push( [ key, obj[ key ] ] );
	}
	return pairs;
}

export function safeGet ( obj, path ) {
	if ( !isObjectLike( obj ) ) return;

	const keys = splitKeypath( path );
	let val = obj;

	for ( let i = 0; i < keys.length; i++ ) {
		val = val[ keys[i] ];
		if ( !isObjectLike( val ) ) return i + 1 === keys.length ? val : undefined;
	}

	return val;
}
