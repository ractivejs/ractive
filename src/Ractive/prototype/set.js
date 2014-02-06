define([
	'state/scheduler',
	'state/pendingResolution',
	'utils/isObject',
	'utils/isEqual',
	'utils/normaliseKeypath',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/makeTransitionManager',
	'Ractive/prototype/shared/replaceData'
], function (
	scheduler,
	pendingResolution,
	isObject,
	isEqual,
	normaliseKeypath,
	clearCache,
	notifyDependants,
	makeTransitionManager,
	replaceData
) {

	'use strict';

	return function ( keypath, value, complete ) {
		var map,
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
		scheduler.start();

		// Manage transitions
		previousTransitionManager = this._transitionManager;
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// ...and notify dependants
		upstreamChanges = getUpstreamChanges( changes );
		if ( upstreamChanges.length ) {
			notifyDependants.multiple( this, upstreamChanges, true );
		}

		notifyDependants.multiple( this, changes );

		scheduler.end();

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


	function updateModel ( ractive, keypath, value, changes ) {
		var cached, previous, wrapped, evaluator;

		// If we're dealing with a wrapped value, try and use its reset method
		wrapped = ractive._wrapped[ keypath ];

		if ( wrapped && wrapped.reset && ( wrapped.get() !== value ) ) {
			wrapped.reset( value );
		}

		// Update evaluator value. This may be from the evaluator itself, or
		// it may be from the wrapper that wraps an evaluator's result - it
		// doesn't matter
		if ( evaluator = ractive._evaluators[ keypath ] ) {
			evaluator.value = value;
		}

		cached = ractive._cache[ keypath ];
		previous = ractive.get( keypath );

		if ( value === cached && typeof value !== 'object' ) {
			return;
		}

		// update the model, if necessary
		if ( !evaluator && ( !wrapped || !wrapped.reset ) ) {
			replaceData( ractive, keypath, value );
		}

		// add this keypath to the list of changes
		changes.push( keypath );

		// clear the cache
		clearCache( ractive, keypath );
	}

	function getUpstreamChanges ( changes ) {
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
	}

});
