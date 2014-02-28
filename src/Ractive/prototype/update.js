define([
	'global/runloop',
	'utils/Promise',
	'shared/makeTransitionManager',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	runloop,
	Promise,
	makeTransitionManager,
	clearCache,
	notifyDependants
) {

	'use strict';

	return function ( keypath, callback ) {
		var promise, fulfilPromise, transitionManager;

		runloop.start( this );

		if ( typeof keypath === 'function' ) {
			callback = keypath;
			keypath = '';
		}

		// manage transitions
		promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
		this._transitionManager = transitionManager = makeTransitionManager( this, fulfilPromise );

		// if we're using update, it's possible that we've introduced new values, and
		// some unresolved references can be dealt with
		clearCache( this, keypath || '' );
		notifyDependants( this, keypath || '' );

		runloop.end();

		// transition manager has finished its work
		transitionManager.init();

		if ( typeof keypath === 'string' ) {
			this.fire( 'update', keypath );
		} else {
			this.fire( 'update' );
		}

		if ( callback ) {
			promise.then( callback.bind( this ) );
		}

		return promise;
	};

});
