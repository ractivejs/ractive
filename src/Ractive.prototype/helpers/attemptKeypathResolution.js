var attemptKeypathResolution = function ( root ) {
	var unresolved, keypath, leftover;

	leftover = [];

	// See if we can resolve any of the unresolved keypaths (if such there be)
	while ( unresolved = root._pendingResolution.splice( 0, 1 )[0] ) {
		keypath = resolveRef( root, unresolved.ref, unresolved.contextStack );
		if ( keypath !== undefined ) {
			// If we've resolved the keypath, we can initialise this item
			unresolved.resolve( keypath );

		} else {
			// If we can't resolve the reference, try again next time.
			leftover.push( unresolved );
		}
	}

	Array.prototype.push.apply( root._pendingResolution, leftover );
};
