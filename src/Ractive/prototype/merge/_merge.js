define([
	'utils/isArray',
	'shared/clearCache',
	'shared/processDeferredUpdates',
	'Ractive/prototype/merge/mapOldToNewIndex',
	'Ractive/prototype/merge/queueDependants'
], function (
	isArray,
	clearCache,
	processDeferredUpdates,
	mapOldToNewIndex,
	queueDependants
) {
	
	'use strict';

	return function ( keypath, array, sameSameButDifferent ) {

		var oldArray, newArray, i, newIndices, mergeQueue, updateQueue, depsByKeypath, deps;

		oldArray = this.get( keypath );

		// If either the existing value or the new value isn't an
		// array, just do a regular set
		if ( !isArray( oldArray ) || !isArray( array ) ) {
			console.log( 'doing regular set' );
			return this.set( keypath, array );
		}


		// if we're dealing with objects that look identical but aren't
		// - i.e. {foo:'bar'} !== {foo:'bar'} - the easiest thing to do is
		// stringify them in order to compare
		if ( sameSameButDifferent ) {
			oldArray = oldArray.map( stringify );
			newArray = array.map( stringify );
		} else {
			newArray = array;
		}


		// find new indices for members of oldArray
		newIndices = mapOldToNewIndex( oldArray, newArray );


		// Clear the cache
		clearCache( this, keypath );

		// Go through all dependant priority levels, finding merge targets
		mergeQueue = [];
		updateQueue = [];

		for ( i=0; i<this._deps.length; i+=1 ) { // we can't cache this._deps.length as it may change!
			depsByKeypath = this._deps[i];

			if ( !depsByKeypath ) {
				continue;
			}

			deps = depsByKeypath[ keypath ];
			
			if ( deps ) {
				queueDependants( keypath, deps, mergeQueue, updateQueue );

				// we may have some deferred evaluators to process
				processDeferredUpdates( this );

				while ( mergeQueue.length ) {
					mergeQueue.pop().merge( newIndices );
				}

				while ( updateQueue.length ) {
					updateQueue.pop().update();
				}
			}
		}

	};

	function stringify ( item ) {
		return JSON.stringify( item );
	}

});