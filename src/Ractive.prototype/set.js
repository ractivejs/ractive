(function ( proto ) {

	var set, resetWrapped;

	proto.set = function ( keypath, value, complete ) {
		var map, changes, upstreamChanges, previousTransitionManager, transitionManager, i, changeHash;

		upstreamChanges = [ '' ]; // empty string will always be an upstream keypath
		changes = [];

		if ( isObject( keypath ) ) {
			map = keypath;
			complete = value;
		}

		// manage transitions
		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// setting multiple values in one go
		if ( map ) {
			for ( keypath in map ) {
				if ( hasOwn.call( map, keypath) ) {
					value = map[ keypath ];
					keypath = normaliseKeypath( keypath );

					set( this, keypath, value, changes, upstreamChanges );
				}
			}
		}

		// setting a single value
		else {
			keypath = normaliseKeypath( keypath );
			set( this, keypath, value, changes, upstreamChanges );
		}

		// if anything has changed, attempt to resolve any unresolved keypaths...
		if ( changes.length && this._pendingResolution.length ) {
			attemptKeypathResolution( this );
		}

		// ...and notify dependants
		if ( upstreamChanges.length ) {
			notifyMultipleDependants( this, upstreamChanges, true );
		}

		if ( changes.length ) {
			notifyMultipleDependants( this, changes );
		}

		// Attributes don't reflect changes automatically if there is a possibility
		// that they will need to change again before the .set() cycle is complete
		// - they defer their updates until all values have been set
		processDeferredUpdates( this );

		// transition manager has finished its work
		this._transitionManager = previousTransitionManager;
		transitionManager.ready();

		// Fire a change event
		if ( ( i = changes.length ) && !this.firingChangeEvent ) {
			this.firingChangeEvent = true; // short-circuit any potential infinite loops
			
			changeHash = {};

			i = changes.length;
			while ( i-- ) {
				changeHash[ changes[i] ] = this.get( changes[i] );
			}

			this.fire( 'change', changeHash );

			this.firingChangeEvent = false;
		}

		return this;
	};


	set = function ( ractive, keypath, value, changes, upstreamChanges ) {
		var cached, keys, previous, key, obj, accumulated, currentKeypath, keypathToClear, wrapped;

		if ( ( wrapped = ractive._wrapped[ keypath ] ) && wrapped.reset ) {
			if ( resetWrapped( ractive, keypath, value, wrapped, changes, upstreamChanges ) !== false ) {
				return;
			}
		}

		cached = ractive._cache[ keypath ];
		previous = ractive.get( keypath );

		keys = keypath.split( '.' );
		accumulated = [];
		
		// update the model, if necessary
		if ( previous !== value ) {
			
			// update data
			obj = ractive.data;
			while ( keys.length > 1 ) {
				key = accumulated[ accumulated.length ] = keys.shift();
				currentKeypath = accumulated.join( '.' );

				if ( wrapped = ractive._wrapped[ currentKeypath ] ) {
					if ( wrapped.set ) {
						wrapped.set( keys.join( '.' ), value );
					}

					obj = wrapped.get();
				}

				else {
					// If this branch doesn't exist yet, create a new one - if the next
					// key matches /^\s*[0-9]+\s*$/, assume we want an array branch rather
					// than an object
					if ( !obj[ key ] ) {
						
						// if we're creating a new branch, we may need to clear the upstream
						// keypath
						if ( !keypathToClear ) {
							keypathToClear = currentKeypath;
						}

						obj[ key ] = ( /^\s*[0-9]+\s*$/.test( keys[0] ) ? [] : {} );
					}

					obj = obj[ key ];
				}
			}

			key = keys[0];
			obj[ key ] = value;
		}

		else {
			// if the value is the same as the cached value AND the value is a primitive,
			// we don't need to do anything else
			if ( value === cached && typeof value !== 'object' ) {
				return;
			}
		}


		// Clear cache
		clearCache( ractive, keypathToClear || keypath );

		// add this keypath to the list of changes
		changes[ changes.length ] = keypath;


		// add upstream keypaths to the list of upstream changes
		keys = keypath.split( '.' );
		while ( keys.length > 1 ) {
			keys.pop();
			keypath = keys.join( '.' );

			if ( !upstreamChanges[ keypath ] ) {
				upstreamChanges[ upstreamChanges.length ] = keypath;
				upstreamChanges[ keypath ] = true;
			}
		}
	};


	resetWrapped = function ( ractive, keypath, value, wrapped, changes, upstreamChanges ) {
		var previous, cached, cacheMap, keys, i;

		previous = wrapped.get();

		if ( !isEqual( previous, value ) ) {
			if ( wrapped.reset( value ) === false ) {
				return false;
			}
		}

		value = wrapped.get();
		cached = ractive._cache[ keypath ];

		if ( !isEqual( cached, value ) ) {
			ractive._cache[ keypath ] = value;

			// Clear downstream keypaths only. Otherwise this wrapper will be torn down!
			// TODO is there a way to intelligently detect whether a wrapper should be
			// torn down?
			cacheMap = ractive._cacheMap[ keypath ];

			if ( cacheMap ) {
				i = cacheMap.length;
				while ( i-- ) {
					clearCache( ractive, cacheMap[i] );
				}
			}

			changes[ changes.length ] = keypath;

			// add upstream keypaths to the list of upstream changes
			keys = keypath.split( '.' );
			while ( keys.length > 1 ) {
				keys.pop();
				keypath = keys.join( '.' );

				if ( !upstreamChanges[ keypath ] ) {
					upstreamChanges[ upstreamChanges.length ] = keypath;
					upstreamChanges[ keypath ] = true;
				}
			}
		}
	};

}( proto ));