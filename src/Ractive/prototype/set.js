define([
	'utils/isObject',
	'utils/isEqual',
	'utils/normaliseKeypath',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/attemptKeypathResolution',
	'shared/makeTransitionManager',
	'shared/processDeferredUpdates',
	'Ractive/prototype/shared/replaceData',
	'Ractive/prototype/observe/getPattern'
], function (
	isObject,
	isEqual,
	normaliseKeypath,
	clearCache,
	notifyDependants,
	attemptKeypathResolution,
	makeTransitionManager,
	processDeferredUpdates,
	replaceData,
	getPattern
) {

	'use strict';

	var set, updateModel, getUpstreamChanges, resetWrapped, updateKeyPath, wildcard = /\*/;

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
					updateKeyPath(this, keypath, value, changes);
				}
			}
		}

		else {
			// Set a single keypath
			updateKeyPath(this, keypath, value, changes);
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

	updateKeyPath = function( ractive, keypath, value, changes ) {
		var values;
		if (wildcard.test(keypath) ) {

			values = getPattern( ractive, keypath );

			for ( keypath in values ) {
				if ( values.hasOwnProperty( keypath ) ) {
					keypath = normaliseKeypath(keypath);
					updateModel( ractive, keypath, value, changes);
				}
			}

		} else {
			keypath = normaliseKeypath( keypath );
			updateModel( ractive, keypath, value, changes );
		}
	}


	updateModel = function ( ractive, keypath, value, changes ) {
		var cached, previous, wrapped, keypathToClear;

		if ( ( wrapped = ractive._wrapped[ keypath ] ) && wrapped.reset ) {
			if ( resetWrapped( ractive, keypath, value, wrapped, changes ) !== false ) {
				return;
			}
		}

		cached = ractive._cache[ keypath ];
		previous = ractive.get( keypath );

		// update the model, if necessary
		if ( previous !== value ) {
			keypathToClear = replaceData( ractive, keypath, value );
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