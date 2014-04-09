define([
	'global/runloop',
	'utils/Promise',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	runloop,
	Promise,
	clearCache,
	notifyDependants
) {

	'use strict';

	return function ( keypath, callback ) {
		var promise, fulfilPromise;

		if ( typeof keypath === 'function' ) {
			callback = keypath;
			keypath = '';
		} else {
			keypath = keypath || '';
		}

		promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
		runloop.start( this, fulfilPromise );

		clearCache( this, keypath );
		notifyDependants( this, keypath );

		runloop.end();

		this.fire( 'update', keypath );

		if ( callback ) {
			promise.then( callback.bind( this ) );
		}

		return promise;
	};

});
