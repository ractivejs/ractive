define( function () {

	'use strict';

	var promise,
		PENDING = {},
		FULFILLED = {},
		REJECTED = {},

		multipleResolutionMessage;

	multipleResolutionMessage = 'A Promise cannot be resolved or rejected multiple times';

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

		makeResolver = function ( fulfilled ) {
			return function ( value ) {
				result = value;

				if ( state !== PENDING ) {
					throw new Error( multipleResolutionMessage );
				}

				if ( fulfilled ) {
					state = FULFILLED;
					wait( dispatchFulfilledHandlers );
				} else {
					state = REJECTED;
					wait( dispatchRejectedHandlers );
				}
			};
		};

		resolve = makeResolver( FULFILLED, fulfilledHandlers );
		reject = makeResolver( REJECTED, rejectedHandlers );

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

								reject( result );
							}
						});
					}

					if ( typeof onRejected === 'function' ) {
						rejectedHandlers.push( function ( p1error ) {
							try {
								onRejected( p1error );
							} catch ( e ) {}

							reject( p1error );
						});
					}

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