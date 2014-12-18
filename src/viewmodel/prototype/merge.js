import { warn } from 'utils/log';
import mapOldToNewIndex from './merge/mapOldToNewIndex';

var comparators = {};

export default function Viewmodel$merge ( keypath, currentArray, array, options ) {
	var oldArray,
		newArray,
		comparator,
		newIndices;

	this.mark( keypath );

	if ( options && options.compare ) {

		comparator = getComparatorFunction( options.compare );

		try {
			oldArray = currentArray.map( comparator );
			newArray = array.map( comparator );
		} catch ( err ) {
			// fallback to an identity check - worst case scenario we have
			// to do more DOM manipulation than we thought...

			// ...unless we're in debug mode of course
			if ( this.debug ) {
				throw err;
			} else {
				warn( 'Merge operation: comparison failed. Falling back to identity checking' );
			}

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
