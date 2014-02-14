define([
	'global/runloop',
	'utils/isObject',
	'utils/isEqual',
	'utils/normaliseKeypath',
	'shared/get/_get',
	'shared/set/_set',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/makeTransitionManager'
], function (
	runloop,
	isObject,
	isEqual,
	normaliseKeypath,
	get,
	set,
	clearCache,
	notifyDependants,
	makeTransitionManager
) {

	'use strict';

	return function Ractive_prototype_set ( keypath, value, complete ) {
		var map,
			changes,
			upstreamChanges,
			transitionManager;

		changes = [];

		runloop.start( this );

		// Manage transitions
		this._transitionManager = transitionManager = makeTransitionManager( this, complete );

		// Set multiple keypaths in one go
		if ( isObject( keypath ) ) {
			map = keypath;
			complete = value;

			for ( keypath in map ) {
				if ( map.hasOwnProperty( keypath) ) {
					value = map[ keypath ];
					keypath = normaliseKeypath( keypath );

					if ( set( this, keypath, value ) ) {
						changes.push( keypath );
					}
				}
			}
		}

		// Set a single keypath
		else {
			keypath = normaliseKeypath( keypath );
			if ( set( this, keypath, value ) ) {
				changes.push( keypath );
			}
		}

		// ...and notify dependants
		upstreamChanges = getUpstreamChanges( changes );
		if ( upstreamChanges.length ) {
			notifyDependants.multiple( this, upstreamChanges, true );
		}

		runloop.end();

		transitionManager.init();

		return this;
	};

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
