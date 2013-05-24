(function ( proto ) {

	var set, attemptKeypathResolution;

	// TODO fire change events as well as set events
	// (cascade at this point, so we can identify all change events, and
	// kill off the dependants map?)

	set = function ( root, keypath, keys, value, queue ) {
		var previous, key, obj;

		previous = root.get( keypath );

		// update the model, if necessary
		if ( previous !== value ) {
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
		}

		else {
			// if value is a primitive, we don't need to do anything else
			if ( typeof value !== 'object' ) {
				return;
			}
		}


		// Clear cache
		clearCache( root, keypath );

		// if we're queueing, add this keypath to the queue
		if ( queue ) {
			queue[ queue.length ] = keypath;
		}

		// otherwise notify dependants immediately
		else {
			notifyDependants( root, keypath );
			attemptKeypathResolution( root );
		}
		

		// TODO fire the right events at the right times
		// Fire set event
		if ( !root.setting ) {
			root.setting = true; // short-circuit any potential infinite loops
			root.fire( 'set', keypath, value );
			root.fire( 'set:' + keypath, value );
			root.setting = false;
		}
		
	};

	attemptKeypathResolution = function ( root ) {
		var i, unresolved, keypath;

		// See if we can resolve any of the unresolved keypaths (if such there be)
		i = root._pendingResolution.length;
		while ( i-- ) { // Work backwards, so we don't go in circles!
			unresolved = root._pendingResolution.splice( i, 1 )[0];

			
			if ( keypath = resolveRef( root, unresolved.ref, unresolved.contextStack ) ) {
				// If we've resolved the keypath, we can initialise this item
				unresolved.resolve( keypath );

			} else {
				// If we can't resolve the reference, add to the back of
				// the queue (this is why we're working backwards)
				root._pendingResolution[ root._pendingResolution.length ] = unresolved;
			}
		}
	};

	


	// TODO notify direct dependants of upstream keypaths
	proto.set = function ( keypath, value ) {
		var notificationQueue, k, normalised, keys, previous;

		// setting multiple values in one go
		if ( isObject( keypath ) ) {
			notificationQueue = [];

			for ( k in keypath ) {
				if ( keypath.hasOwnProperty( k ) ) {
					keys = splitKeypath( k );
					normalised = keys.join( '.' );
					value = keypath[k];

					set( this, normalised, keys, value, notificationQueue );
				}
			}

			// if anything has changed, notify dependants and attempt to resolve
			// any unresolved keypaths
			if ( notificationQueue.length ) {
				while ( notificationQueue.length ) {
					notifyDependants( this, notificationQueue.pop() );
				}

				attemptKeypathResolution( this );
			}
		}

		// setting a single value
		else {
			keys = splitKeypath( keypath );
			normalised = keys.join( '.' );

			set( this, normalised, keys, value );
		}

		// Attributes don't reflect changes automatically if there is a possibility
		// that they will need to change again before the .set() cycle is complete
		// - they defer their updates until all values have been set
		while ( this._def.length ) {
			// Update the attribute, then deflag it
			this._def.pop().update().deferred = false;
		}
	};

}( proto ));