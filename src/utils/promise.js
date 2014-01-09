define( function () {

	'use strict';

	var promise,
		PENDING = {},
		FULFILLED = {},
		REJECTED = {};

	promise = function ( callback ) {
		var fulfilledHandlers, rejectedHandlers, state, result, makeDispatcher, dispatchFulfilledHandlers, dispatchRejectedHandlers, makeResolver, resolve, reject, pendingDispatch;

		fulfilledHandlers = [];
		rejectedHandlers = [];

		state = PENDING;

		makeDispatcher = function ( handlers ) {
			return function () {
				var handler;

				while ( handler = handlers.shift() ) {
					handler( result );
				}

				pendingDispatch = false;
			};
		};

		dispatchFulfilledHandlers = makeDispatcher( fulfilledHandlers );
		dispatchRejectedHandlers = makeDispatcher( rejectedHandlers );

		makeResolver = function ( newState, dispatch ) {
			return function ( value ) {
				result = value;

				if ( state !== PENDING ) {
					return;
				}

				state = newState;
				wait( dispatch );
			};
		};

		resolve = makeResolver( FULFILLED, dispatchFulfilledHandlers );
		reject = makeResolver( REJECTED, dispatchRejectedHandlers );

		callback( resolve, reject );

		return {
			then: function ( onFulfilled, onRejected ) {
				return promise( function ( resolve, reject ) {

					if ( typeof onFulfilled === 'function' ) {
						fulfilledHandlers.push( function ( p1result ) {
							var result;

							try {
								result = onFulfilled( p1result );

								if ( isPromise( result ) ) {
									result.then( resolve, reject );
								} else {
									resolve( result );
								}
							} catch ( err ) {
								try {
									onRejected( result );
								} catch ( e ) {}

								reject( err );
							}
						});
					}

					if ( typeof onRejected === 'function' ) {
						rejectedHandlers.push( function ( p1error ) {
							try {
								onRejected( p1error );
							} catch ( e ) {
								reject( e );
								return;
							}
						});
					}

					// Always pass fulfillments and rejections through, even if there is no onFulfilled/onRejected.
					fulfilledHandlers.push( function ( result ) {
						resolve( result );
					});
					rejectedHandlers.push( function ( p1error ) {
						reject( p1error );
					});

					if ( state !== PENDING && !pendingDispatch ) {
						wait( state === FULFILLED ? dispatchFulfilledHandlers : dispatchRejectedHandlers );
					}

				});
			}
		};
	};

	promise.all = function ( promises ) {
		return promise( function ( resolve, reject ) {
			var result = [], pending, i, decrement, processPromise;

			decrement = function () {
				if ( !--pending ) {
					resolve( result );
				}
			};

			processPromise = function ( i ) {
				promises[i].then( function ( value ) {
					result[i] = value;
					decrement();
				}, reject );
			};

			pending = i = promises.length;
			while ( i-- ) {
				processPromise( i );
			}
		});
	};

	return promise;

	// TODO use MutationObservers or something to simulate setImmediate
	function wait ( callback ) {
		setTimeout( callback, 0 );
	}

	function isPromise ( candidate ) {
		return ( candidate && typeof candidate.then === 'function' );
	}

});
