define([
	'global/runloop',
	'utils/warn',
	'utils/isArray',
	'utils/Promise',
	'shared/set',
	'Ractive/prototype/merge/mapOldToNewIndex',
	'Ractive/prototype/merge/propagateChanges'
], function (
	runloop,
	warn,
	isArray,
	Promise,
	set,
	mapOldToNewIndex,
	propagateChanges
) {

	'use strict';

	var comparators = {};

	return function merge ( keypath, array, options ) {

		var currentArray,
			oldArray,
			newArray,
			comparator,
			lengthUnchanged,
			newIndices,
			promise,
			fulfilPromise;

		currentArray = this.get( keypath );

		// If either the existing value or the new value isn't an
		// array, just do a regular set
		if ( !isArray( currentArray ) || !isArray( array ) ) {
			return this.set( keypath, array, options && options.complete );
		}

		lengthUnchanged = ( currentArray.length === array.length );

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


		// Manage transitions
		promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
		runloop.start( this, fulfilPromise );

		// Update the model
		// TODO allow existing array to be updated in place, rather than replaced?
		set( this, keypath, array, true );
		propagateChanges( this, keypath, newIndices, lengthUnchanged );
		runloop.end();

		// attach callback as fulfilment handler, if specified
		if ( options && options.complete ) {
			promise.then( options.complete );
		}

		return promise;
	};

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

});
