define([ 'shared/resolveRef' ], function ( resolveRef ) {
	
	'use strict';

	var push = Array.prototype.push;

	return function ( ractive ) {
		var unresolved, keypath, leftover;

		// See if we can resolve any of the unresolved keypaths (if such there be)
		while ( unresolved = ractive._pendingResolution.pop() ) {
			keypath = resolveRef( ractive, unresolved.ref, unresolved.contextStack );
		
			if ( keypath !== undefined ) {
				// If we've resolved the keypath, we can initialise this item
				unresolved.resolve( keypath );

			} else {
				// If we can't resolve the reference, try again next time
				( leftover || ( leftover = [] ) ).push( unresolved );
			}
		}

		if ( leftover ) {
			push.apply( ractive._pendingResolution, leftover );
		}
	};

});