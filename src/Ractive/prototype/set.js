define([
	'utils/isObject',
	'utils/isEqual',
	'utils/normaliseKeypath',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/attemptKeypathResolution',
	'shared/makeTransitionManager',
	'shared/midCycleUpdate',
	'shared/endCycleUpdate',
	'Ractive/prototype/shared/replaceData'
], function (
	isObject,
	isEqual,
	normaliseKeypath,
	clearCache,
	notifyDependants,
	attemptKeypathResolution,
	makeTransitionManager,
	midCycleUpdate,
	endCycleUpdate,
	replaceData
) {

	'use strict';

	var set, updateModel, getUpstreamChanges, resetWrapped;

	set = function ( keypath, value, complete ) {
		var endCycleUpdateRequired,
			map,
			changes,
			upstreamChanges,
			previousTransitionManager,
			transitionManager,
			i,
			changeHash;

		changes = [];

		// Set multiple keypaths in one go
		if ( isObject( keypath ) ) {
			map = keypath;
			complete = value;

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

		// If an end-cycle-update isn't scheduled already, we need to
		// take care of that
		if ( !this._updateScheduled ) {
			endCycleUpdateRequired = this._updateScheduled = true;
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
		midCycleUpdate( this );

		if ( endCycleUpdateRequired ) {
			endCycleUpdate( this );
		}

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
		var cached, previous, wrapped, evaluator;

		if ( ( wrapped = ractive._wrapped[ keypath ] ) && wrapped.reset ) {
			if ( resetWrapped( ractive, keypath, value, wrapped, changes ) !== false ) {
				clearCache( ractive, keypath );
				return;
			}
		}

		// Update evaluator value. This may be from the evaluator itself, or
		// it may be from the wrapper that wraps an evaluator's result - it
		// doesn't matter
		if ( evaluator = ractive._evaluators[ keypath ] ) {
			evaluator.value = value;
		}

		cached = ractive._cache[ keypath ];
		previous = ractive.get( keypath );

		// update the model, if necessary
		if ( previous !== value && !evaluator ) {
			replaceData( ractive, keypath, value );
		}

		else {
			// if the value is the same as the cached value AND the value is a primitive,
			// we don't need to do anything else
			if ( value === cached && typeof value !== 'object' ) {
				return;
			}
		}

		// add this keypath to the list of changes
		changes.push( keypath );

		// clear the cache
		clearCache( ractive, keypath );
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
					upstreamChanges.push( upstreamKeypath );
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

			changes.push( keypath );
		}
	};

	return set;

});