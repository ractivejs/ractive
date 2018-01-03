export default {
  filter: function (object) {
    // Detect "thenables" according to Promises/A+ §1.2.
    return object != null && typeof object.then === 'function'
  },
  wrap: function (instance, object, keypath, prefix) {
    let removed = false

    // While the promise is still pending, return a null.
    const get = () => null

    // No support for setting properties while still a promise.
    const set = () => {}

    // Always replace the promise if we're setting something on the keypath.
    const reset = () => false

    // The Promises/A+ specification doesn't define a way to stop
    // "listening" to a Promise, so we just note the removal.
    const teardown = () => { removed = true }

    // Replace the wrapper with the actual result only if it's not removed
    const setter = result => { removed ? void 0 : instance.set(keypath, result) }
    object.then(setter, setter)

    return { get, set, reset, teardown }
  }
}
