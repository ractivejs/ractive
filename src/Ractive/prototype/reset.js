define([
	'utils/Promise',
	'global/runloop',
	'shared/makeTransitionManager',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	Promise,
	runloop,
	makeTransitionManager,
	clearCache,
	notifyDependants
) {

	'use strict';

	return function ( data, callback ) {
		var promise, fulfilPromise, transitionManager, wrapper;

		if ( typeof data === 'function' ) {
			callback = data;
			data = {};
		} else {
			data = data || {};
		}

		if ( typeof data !== 'object' ) {
			throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
		}

		runloop.start( this );

		// Manage transitions
		promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });
		this._transitionManager = transitionManager = makeTransitionManager( this, fulfilPromise );

		if ( callback ) {
			promise.then( callback );
		}

		// If the root object is wrapped, try and use the wrapper's reset value
		if ( ( wrapper = this._wrapped[ '' ] ) && wrapper.reset ) {
			if ( wrapper.reset( data ) === false ) {
				// reset was rejected, we need to replace the object
				this.data = data;
			}
		} else {
			this.data = data;
		}

		clearCache( this, '' );
		notifyDependants( this, '' );

		runloop.end();
		transitionManager.init();

		this.fire( 'reset', data );

		return promise;
	};

});
