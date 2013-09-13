var attemptKeypathResolution = function ( root ) {
	var i, unresolved, keypath;

	// See if we can resolve any of the unresolved keypaths (if such there be)
	i = root._pendingResolution.length;
	while ( i-- ) { // Work backwards, so we don't go in circles!
		unresolved = root._pendingResolution.splice( i, 1 )[0];

		keypath = resolveRef( root, unresolved.ref, unresolved.contextStack );
		if ( keypath !== undefined ) {
			// If we've resolved the keypath, we can initialise this item
			unresolved.resolve( keypath );

		} else {
			// If we can't resolve the reference, add to the back of
			// the queue (this is why we're working backwards)
			root._pendingResolution[ root._pendingResolution.length ] = unresolved;
		}
	}
};