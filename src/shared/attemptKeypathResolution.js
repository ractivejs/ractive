define([ 'shared/resolveRef' ], function ( resolveRef ) {
	
	'use strict';

	return function ( ractive ) {
		var i, unresolved, keypath;

		// See if we can resolve any of the unresolved keypaths (if such there be)
		i = ractive._pendingResolution.length;
		while ( i-- ) { // Work backwards, so we don't go in circles!
			unresolved = ractive._pendingResolution.splice( i, 1 )[0];

			keypath = resolveRef( ractive, unresolved.ref, unresolved.contextStack );
			if ( keypath !== undefined ) {
				// If we've resolved the keypath, we can initialise this item
				unresolved.resolve( keypath );

			} else {
				// If we can't resolve the reference, add to the back of
				// the queue (this is why we're working backwards)
				ractive._pendingResolution[ ractive._pendingResolution.length ] = unresolved;
			}
		}
	};

});