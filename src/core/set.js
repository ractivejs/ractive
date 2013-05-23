(function ( proto ) {

	var setSingle, setMultiple;

	setSingle = function ( root, keypath, value ) {
		var keys, key, obj, normalised, i, unresolved;

		if ( utils.isArray( keypath ) ) {
			keys = keypath.slice();
		} else {
			keys = utils.splitKeypath( keypath );
		}

		normalised = keys.join( '.' );

		// Clear cache
		utils.clearCache( root, normalised );

		// update data
		obj = root.data;
		while ( keys.length > 1 ) {
			key = keys.shift();

			// If this branch doesn't exist yet, create a new one - if the next
			// key matches /^\s*[0-9]+\s*$/, assume we want an array branch rather
			// than an object
			if ( !obj[ key ] ) {
				obj[ key ] = ( /^\s*[0-9]+\s*$/.test( keys[0] ) ? [] : {} );
			}

			obj = obj[ key ];
		}

		key = keys[0];

		obj[ key ] = value;

		// Fire set event
		if ( !root.setting ) {
			root.setting = true; // short-circuit any potential infinite loops
			root.fire( 'set', normalised, value );
			root.fire( 'set:' + normalised, value );
			root.setting = false;
		}

		// Trigger updates of mustaches that observe `keypaths` or its descendants
		utils.notifyDependants( root, normalised );

		// See if we can resolve any of the unresolved keypaths (if such there be)
		i = root._pendingResolution.length;
		while ( i-- ) { // Work backwards, so we don't go in circles!
			unresolved = root._pendingResolution.splice( i, 1 )[0];

			
			if ( keypath = utils.resolveRef( root, unresolved.ref, unresolved.contextStack ) ) {
				// If we've resolved the keypath, we can initialise this item
				unresolved.resolve( keypath );

			} else {
				// If we can't resolve the reference, add to the back of
				// the queue (this is why we're working backwards)
				root._pendingResolution[ root._pendingResolution.length ] = unresolved;
			}
		}
	};

	setMultiple = function ( root, map ) {
		var keypath;

		for ( keypath in map ) {
			if ( map.hasOwnProperty( keypath ) ) {
				setSingle( root, keypath, map[ keypath ] );
			}
		}
	};

	proto.set = function ( keypath, value ) {
		if ( utils.isObject( keypath ) ) {
			setMultiple( this, keypath );
		} else {
			setSingle( this, keypath, value );
		}

		// Attributes don't reflect changes automatically if there is a possibility
		// that they will need to change again before the .set() cycle is complete
		// - they defer their updates until all values have been set
		while ( this._defAttrs.length ) {
			// Update the attribute, then deflag it
			this._defAttrs.pop().update().deferred = false;
		}
	};

}( proto ));