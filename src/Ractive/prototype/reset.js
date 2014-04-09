define([
	'utils/Promise',
	'global/runloop',
	'shared/clearCache',
	'shared/notifyDependants'
], function (
	Promise,
	runloop,
	clearCache,
	notifyDependants
) {

	'use strict';

	return function ( data, callback ) {
		var promise, fulfilPromise, wrapper;

		if ( typeof data === 'function' ) {
			callback = data;
			data = {};
		} else {
			data = data || {};
		}

		if ( typeof data !== 'object' ) {
			throw new Error( 'The reset method takes either no arguments, or an object containing new data' );
		}

		promise = new Promise( function ( fulfil ) { fulfilPromise = fulfil; });

		if ( callback ) {
			promise.then( callback );
		}

		runloop.start( this, fulfilPromise );

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

		this.fire( 'reset', data );

		return promise;
	};

});
