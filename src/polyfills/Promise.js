import { isFunction, isObjectType } from 'utils/is';
import { base } from 'config/environment';

/* istanbul ignore if */
if (!base.Promise) {
  const PENDING = {};
  const FULFILLED = {};
  const REJECTED = {};

  const Promise = (base.Promise = function(callback) {
    const fulfilledHandlers = [];
    const rejectedHandlers = [];
    let state = PENDING;
    let result;
    let dispatchHandlers;

    const makeResolver = newState => {
      return function(value) {
        if (state !== PENDING) return;
        result = value;
        state = newState;
        dispatchHandlers = makeDispatcher(
          state === FULFILLED ? fulfilledHandlers : rejectedHandlers,
          result
        );
        wait(dispatchHandlers);
      };
    };

    const fulfill = makeResolver(FULFILLED);
    const reject = makeResolver(REJECTED);

    try {
      callback(fulfill, reject);
    } catch (err) {
      reject(err);
    }

    return {
      // `then()` returns a Promise - 2.2.7
      then(onFulfilled, onRejected) {
        const promise2 = new Promise((fulfill, reject) => {
          const processResolutionHandler = (handler, handlers, forward) => {
            if (isFunction(handler)) {
              handlers.push(p1result => {
                try {
                  resolve(promise2, handler(p1result), fulfill, reject);
                } catch (err) {
                  reject(err);
                }
              });
            } else {
              handlers.push(forward);
            }
          };

          processResolutionHandler(onFulfilled, fulfilledHandlers, fulfill);
          processResolutionHandler(onRejected, rejectedHandlers, reject);

          if (state !== PENDING) {
            wait(dispatchHandlers);
          }
        });
        return promise2;
      },
      catch(onRejected) {
        return this.then(null, onRejected);
      },
      finally(callback) {
        return this.then(
          v => {
            callback();
            return v;
          },
          e => {
            callback();
            throw e;
          }
        );
      }
    };
  });

  Promise.all = function(promises) {
    return new Promise((fulfill, reject) => {
      const result = [];
      let pending;
      let i;

      if (!promises.length) {
        fulfill(result);
        return;
      }

      const processPromise = (promise, i) => {
        if (promise && isFunction(promise.then)) {
          promise.then(value => {
            result[i] = value;
            --pending || fulfill(result);
          }, reject);
        } else {
          result[i] = promise;
          --pending || fulfill(result);
        }
      };

      pending = i = promises.length;

      while (i--) {
        processPromise(promises[i], i);
      }
    });
  };

  Promise.race = function(promises) {
    return new Promise((fulfill, reject) => {
      let pending = true;
      function ok(v) {
        if (!pending) return;
        pending = false;
        fulfill(v);
      }
      function fail(e) {
        if (!pending) return;
        pending = false;
        reject(e);
      }
      for (let i = 0; i < promises.length; i++) {
        if (promises[i] && isFunction(promises[i].then)) {
          promises[i].then(ok, fail);
        }
      }
    });
  };

  Promise.resolve = function(value) {
    if (value && isFunction(value.then)) return value;
    return new Promise(fulfill => {
      fulfill(value);
    });
  };

  Promise.reject = function(reason) {
    if (reason && isFunction(reason.then)) return reason;
    return new Promise((fulfill, reject) => {
      reject(reason);
    });
  };

  // TODO use MutationObservers or something to simulate setImmediate
  const wait = function(callback) {
    setTimeout(callback, 0);
  };

  const makeDispatcher = function(handlers, result) {
    return function() {
      for (let handler; (handler = handlers.shift()); ) {
        handler(result);
      }
    };
  };

  const resolve = function(promise, x, fulfil, reject) {
    let then;
    if (x === promise) {
      throw new TypeError(`A promise's fulfillment handler cannot return the same promise`);
    }
    if (x instanceof Promise) {
      x.then(fulfil, reject);
    } else if (x && (isObjectType(x) || isFunction(x))) {
      try {
        then = x.then;
      } catch (e) {
        reject(e);
        return;
      }
      if (isFunction(then)) {
        let called;

        const resolvePromise = function(y) {
          if (called) return;
          called = true;
          resolve(promise, y, fulfil, reject);
        };
        const rejectPromise = function(r) {
          if (called) return;
          called = true;
          reject(r);
        };

        try {
          then.call(x, resolvePromise, rejectPromise);
        } catch (e) {
          if (!called) {
            reject(e);
            called = true;
            return;
          }
        }
      } else {
        fulfil(x);
      }
    } else {
      fulfil(x);
    }
  };
}
