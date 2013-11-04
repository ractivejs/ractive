define([
	'utils/isObject',
	'utils/isEqual',
	'utils/normaliseKeypath',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/attemptKeypathResolution',
	'shared/makeTransitionManager',
	'shared/processDeferredUpdates'
], function (
	isObject,
	isEqual,
	normaliseKeypath,
	clearCache,
	notifyDependants,
	attemptKeypathResolution,
	makeTransitionManager,
	processDeferredUpdates
) {

	'use strict';

	var set,

		// helpers
		updateModel,
		getUpstreamChanges,
		resetWrapped;

	set = function ( keypath, value, complete ) {
		var map, changes, upstreamChanges, previousTransitionManager, transitionManager, i, changeHash;

		changes = [];

		if ( isObject( keypath ) ) {
			map = keypath;
			complete = value;
		}

		// Set multiple keypaths in one go
		if ( map ) {
			for ( keypath in map ) {
				if ( map.hasOwnProperty( keypath) ) {
					value = map[ keypath ];
					keypath = normaliseKeypath( keypath );

					updateModel( this, keypath, value, changes );
				}
			}
		}

		// Set a single keypath
		else {
			keypath = normaliseKeypath( keypath );
			updateModel( this, keypath, value, changes );
		}

		if ( !changes.length ) {
			return;
		}

		// Manage transitions
		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// ...and notify dependants
		upstreamChanges = getUpstreamChanges( changes );
		if ( upstreamChanges.length ) {
			notifyDependants.multiple( this, upstreamChanges, true );
		}

		notifyDependants.multiple( this, changes );

		// Attempt to resolve any unresolved keypaths...
		if ( this._pendingResolution.length ) {
			attemptKeypathResolution( this );
		}

		// Attributes don't reflect changes automatically if there is a possibility
		// that they will need to change again before the .set() cycle is complete
		// - they defer their updates until all values have been set
		processDeferredUpdates( this );

		// transition manager has finished its work
		this._transitionManager = previousTransitionManager;
		transitionManager.ready();

		// Fire a change event
		if ( !this.firingChangeEvent ) {
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


	updateModel = function ( ractive, keypath, value, changes ) {
		var cached, keys, previous, key, obj, accumulated, currentKeypath, keypathToClear, wrapped;

		if ( ( wrapped = ractive._wrapped[ keypath ] ) && wrapped.reset ) {
			if ( resetWrapped( ractive, keypath, value, wrapped, changes ) !== false ) {
				return;
			}
		}

		cached = ractive._cache[ keypath ];
		previous = ractive.get( keypath );

		keys = keypath.split( '.' );
		accumulated = [];

		// update the model, if necessary
		if ( previous !== value ) {
			
			// Get the root object
			if ( wrapped = ractive._wrapped[ '' ] ) {
				if ( wrapped.set ) {
					// Root object is wrapped, so we need to use the wrapper's
					// set() method
					wrapped.set( keys.join( '.' ), value );
				}

				obj = wrapped.get();
			} else {
				obj = ractive.data;
			}

			
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
	};

	getUpstreamChanges = function ( changes ) {
		var upstreamChanges = [ '' ], i, keypath, keys, upstreamKeypath;

		i = changes.length;
		while ( i-- ) {
			keypath = changes[i];
			keys = keypath.split( '.' );

			while ( keys.length > 1 ) {
				keys.pop();
				upstreamKeypath = keys.join( '.' );

				if ( !upstreamChanges[ upstreamKeypath ] ) {
					upstreamChanges[ upstreamChanges.length ] = upstreamKeypath;
					upstreamChanges[ upstreamKeypath ] = true;
				}
			}
		}

		return upstreamChanges;
	};


	resetWrapped = function ( ractive, keypath, value, wrapped, changes ) {
		var previous, cached, cacheMap, i;

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
		}
	};

	return set;

});