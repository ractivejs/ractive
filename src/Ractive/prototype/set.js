define([
	'global/runloop',
	'utils/isObject',
	'utils/normaliseKeypath',
	'utils/Promise',
	'shared/set'
], function (
	runloop,
	isObject,
	normaliseKeypath,
	Promise,
	set
) {

	'use strict';

	return function Ractive_prototype_set ( keypath, value, callback ) {
		var map,
			promise,
			fulfilPromise;

		promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
		runloop.start( this, fulfilPromise );

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

		if ( callback ) {
			promise.then( callback.bind( this ) );
		}

		return promise;
	};

});
