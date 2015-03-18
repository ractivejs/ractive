import { warnIfDebug } from 'utils/log';
import mapOldToNewIndex from './merge/mapOldToNewIndex';

var comparators = {};

export default function Viewmodel$merge ( keypath, currentArray, array, options ) {
	var oldArray,
		newArray,
		comparator,
		newIndices;

	keypath.mark();

	if ( options && options.compare ) {

		comparator = getComparatorFunction( options.compare );

		try {
			oldArray = currentArray.map( comparator );
			newArray = array.map( comparator );
		} catch ( err ) {
			// fallback to an identity check - worst case scenario we have
			// to do more DOM manipulation than we thought...
			warnIfDebug( 'merge(): "%s" comparison failed. Falling back to identity checking', keypath );

			oldArray = currentArray;
			newArray = array;
		}

	} else {
		oldArray = currentArray;
		newArray = array;
	}

	// find new indices for members of oldArray
	newIndices = mapOldToNewIndex( oldArray, newArray );

	this.smartUpdate( keypath, array, newIndices, currentArray.length !== array.length );
}

function stringify ( item ) {
	return JSON.stringify( item );
}

function getComparatorFunction ( comparator ) {
	// If `compare` is `true`, we use JSON.stringify to compare
	// objects that are the same shape, but non-identical - i.e.
	// { foo: 'bar' } !== { foo: 'bar' }
	if ( comparator === true ) {
		return stringify;
	}

	if ( typeof comparator === 'string' ) {
		if ( !comparators[ comparator ] ) {
			comparators[ comparator ] = function ( item ) {
				return item[ comparator ];
			};
		}

		return comparators[ comparator ];
	}

	if ( typeof comparator === 'function' ) {
		return comparator;
	}

	throw new Error( 'The `compare` option must be a function, or a string representing an identifying field (or `true` to use JSON.stringify)' );
}
