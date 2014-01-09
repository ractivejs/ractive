define( function () {

	'use strict';

	var Promise,
		PENDING = {},
		FULFILLED = {},
		REJECTED = {};

	Promise = function ( callback ) {
		var fulfilledHandlers,
			rejectedHandlers,
			state,
			result,
			makeDispatcher,
			dispatchFulfilledHandlers,
			dispatchRejectedHandlers,
			makeResolver,
			fulfil,
			reject,
			pendingDispatch,
			promise;

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

		fulfil = makeResolver( FULFILLED, dispatchFulfilledHandlers );
		reject = makeResolver( REJECTED, dispatchRejectedHandlers );

		callback( fulfil, reject );

		promise = {
			// `then()` returns a Promise - 2.2.7
			then: function ( onFulfilled, onRejected ) {
				var promise2 = new Promise( function ( fulfil, reject ) {

					var dealWith = function ( handler, handlers, disposeOf ) {
						// [[Resolve]](promise2, x)

						// 2.2.1.1
						if ( typeof handler === 'function' ) {
							handlers.push( function ( p1result ) {
								var x, then, Resolve;

								var Resolve = function ( x ) {
									// Promise Resolution Procedure

									// 2.3.1
									if ( x === promise2 ) {
										throw new TypeError( 'A promise\'s fulfillment handler cannot return the same promise' );
									}

									// 2.3.2
									if ( x instanceof Promise ) {
										x.then( fulfil, reject ); // TODO does this need to happen synchronously?
									}

									// 2.3.3
									else if ( x && typeof x === 'object' || typeof x === 'function' ) {
										try {
											then = x.then; // 2.3.3.1
										} catch ( e ) {
											reject( e ); // 2.3.3.2
											return;
										}

										// 2.3.3.3
										if ( typeof then === 'function' ) {
											var called; // TODO what?

											var resolvePromise = function ( y ) {
												if ( called ) {
													return;
												}
												called = true;
												Resolve( y );
											};

											var rejectPromise = function ( r ) {
												if ( called ) {
													return;
												}
												called = true;
												reject( r );
											};

											try {
												then.call( x, resolvePromise, rejectPromise );
											} catch ( e ) {
												if ( !called ) { // 2.3.3.3.4.1
													reject( e ); // 2.3.3.3.4.2
													return;
												}
											}
										}

										else {
											fulfil( x );
										}
									}

									else {
										fulfil( x );
									}
								}

								try {
									x = handler( p1result );
									Resolve( x );
								} catch ( err ) {
									reject( err );
								}
							});
						} else {
							handlers.push( function ( result ) {
								disposeOf( result );
							});
						}
					};

					dealWith( onFulfilled, fulfilledHandlers, fulfil );
					dealWith( onRejected, rejectedHandlers, reject );


					if ( state !== PENDING && !pendingDispatch ) {
						wait( state === FULFILLED ? dispatchFulfilledHandlers : dispatchRejectedHandlers );
					}

				});

				return promise2;
			}
		};

		return promise;
	};

	Promise.all = function ( promises ) {
		return new Promise( function ( resolve, reject ) {
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

	return Promise;

	// TODO use MutationObservers or something to simulate setImmediate
	function wait ( callback ) {
		setTimeout( callback, 0 );
	}

	function isThenable ( candidate ) {
		return ( candidate && typeof candidate.then === 'function' );
	}

});
