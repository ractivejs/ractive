let _Promise;
const PENDING = {};
const FULFILLED = {};
const REJECTED = {};

if ( typeof Promise === 'function' ) {
	// use native Promise
	_Promise = Promise;
} else {
	_Promise = function ( callback ) {
		const fulfilledHandlers = [];
		const rejectedHandlers = [];
		let state = PENDING;
		let result, dispatchHandlers;

		const makeResolver = function ( newState ) {
			return function ( value ) {
				if ( state !== PENDING ) {
					return;
				}

				result = value;
				state = newState;

				dispatchHandlers = makeDispatcher( ( state === FULFILLED ? fulfilledHandlers : rejectedHandlers ), result );

				// dispatch onFulfilled and onRejected handlers asynchronously
				wait( dispatchHandlers );
			};
		};

		const fulfil = makeResolver( FULFILLED );
		const reject = makeResolver( REJECTED );

		try {
			callback( fulfil, reject );
		} catch ( err ) {
			reject( err );
		}

		const promise = {
			// `then()` returns a Promise - 2.2.7
			then ( onFulfilled, onRejected ) {
				const promise2 = new _Promise( ( fulfil, reject ) => {

					const processResolutionHandler = function ( handler, handlers, forward ) {

						// 2.2.1.1
						if ( typeof handler === 'function' ) {
							handlers.push( ( p1result ) => {
								let x;

								try {
									x = handler( p1result );
									resolve( promise2, x, fulfil, reject );
								} catch ( err ) {
									reject( err );
								}
							});
						} else {
							// Forward the result of promise1 to promise2, if resolution handlers
							// are not given
							handlers.push( forward );
						}
					};

					// 2.2
					processResolutionHandler( onFulfilled, fulfilledHandlers, fulfil );
					processResolutionHandler( onRejected, rejectedHandlers, reject );

					if ( state !== PENDING ) {
						// If the promise has resolved already, dispatch the appropriate handlers asynchronously
						wait( dispatchHandlers );
					}

				});

				return promise2;
			}
		};

		promise[ 'catch' ] = function ( onRejected ) {
			return this.then( null, onRejected );
		};

		return promise;
	};

	_Promise.all = function ( promises ) {
		return new _Promise( ( fulfil, reject ) => {
			const result = [];
			let pending, i;

			if ( !promises.length ) {
				fulfil( result );
				return;
			}

			const processPromise = ( promise, i ) => {
				if ( promise && typeof promise.then === 'function' ) {
					promise.then( value => {
						result[i] = value;
						--pending || fulfil( result );
					}, reject );
				}

				else {
					result[i] = promise;
					--pending || fulfil( result );
				}
			};

			pending = i = promises.length;
			while ( i-- ) {
				processPromise( promises[i], i );
			}
		});
	};

	_Promise.resolve = function ( value ) {
		return new _Promise( ( fulfil ) => {
			fulfil( value );
		});
	};

	_Promise.reject = function ( reason ) {
		return new _Promise( ( fulfil, reject ) => {
			reject( reason );
		});
	};
}

export default _Promise;

// TODO use MutationObservers or something to simulate setImmediate
function wait ( callback ) {
	setTimeout( callback, 0 );
}

function makeDispatcher ( handlers, result ) {
	return function () {
		let handler;

		while ( handler = handlers.shift() ) {
			handler( result );
		}
	};
}

function resolve ( promise, x, fulfil, reject ) {
	// Promise Resolution Procedure
	let then;

	// 2.3.1
	if ( x === promise ) {
		throw new TypeError( 'A promise\'s fulfillment handler cannot return the same promise' );
	}

	// 2.3.2
	if ( x instanceof _Promise ) {
		x.then( fulfil, reject );
	}

	// 2.3.3
	else if ( x && ( typeof x === 'object' || typeof x === 'function' ) ) {
		try {
			then = x.then; // 2.3.3.1
		} catch ( e ) {
			reject( e ); // 2.3.3.2
			return;
		}

		// 2.3.3.3
		if ( typeof then === 'function' ) {
			let called;

			const resolvePromise = function ( y ) {
				if ( called ) {
					return;
				}
				called = true;
				resolve( promise, y, fulfil, reject );
			};

			const rejectPromise = function ( r ) {
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
					called = true;
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
