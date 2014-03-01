define([
	'global/runloop',
	'utils/isObject',
	'utils/isEqual',
	'utils/normaliseKeypath',
	'utils/Promise',
	'shared/get/_get',
	'shared/set',
	'shared/clearCache',
	'shared/notifyDependants',
	'shared/makeTransitionManager'
], function (
	runloop,
	isObject,
	isEqual,
	normaliseKeypath,
	Promise,
	get,
	set,
	clearCache,
	notifyDependants,
	makeTransitionManager
) {

	'use strict';

	return function Ractive_prototype_set ( keypath, value, callback ) {
		var map,
			promise,
			fulfilPromise,
			transitionManager;

		runloop.start( this );

		// Manage transitions
		promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
		this._transitionManager = transitionManager = makeTransitionManager( this, fulfilPromise );

		// Set multiple keypaths in one go
		if ( isObject( keypath ) ) {
			map = keypath;
			callback = value;

			for ( keypath in map ) {
				if ( map.hasOwnProperty( keypath) ) {
					value = map[ keypath ];
					keypath = normaliseKeypath( keypath );

					set( this, keypath, value );
				}
			}
		}

		// Set a single keypath
		else {
			keypath = normaliseKeypath( keypath );
			set( this, keypath, value );
		}

		runloop.end();
		transitionManager.init();

		if ( callback ) {
			promise.then( callback.bind( this ) );
		}

		return promise;
	};

});
