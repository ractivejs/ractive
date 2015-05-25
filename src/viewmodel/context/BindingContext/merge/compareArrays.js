import mapOldToNewIndex from './mapOldToNewIndex';

export default function compareArrays ( oldArray, newArray, compare  ) {
	let compareArrays;

	if ( compare ) {
		const comparator = getComparatorFunction( compare );
		compareArrays = getComparisonArrays( currentArray, array, comparator );
	}

	// Either no compare option or compare functions failed
	if ( !compareArrays ) {
		compareArrays =  { oldArray, newArray };
	}

	// find new indices for members of oldArray
	return mapOldToNewIndex( compareArrays );
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

function stringify ( item ) {
	return JSON.stringify( item );
}

// isolate try/catch to minimize non-optimization
function getComparisonArrays ( currentArray, array, comparator ) {
	try {
		return {
			oldArray: currentArray.map( comparator ),
			newArray: array.map( comparator )
		};
	} catch ( err ) {
		// fallback to an identity check - worst case scenario we have
		// to do more DOM manipulation than we thought...
		warnIfDebug( `merge(): Comparison failed. Falling back to identity checking. Error reported as: ${err}` );
	}
}
