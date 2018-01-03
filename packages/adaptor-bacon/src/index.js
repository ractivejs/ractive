const isObservable = o => o && typeof o.subscribe === 'function'
const isObserver = o => o && typeof o.push === 'function'

export default {
  filter (object) {
    return isObservable(object)
  },
  wrap (instance, observable, keypath) {
    let lock = 0
    let currentValue

    const unsubscribe = observable.subscribe(event => {
      if (event.hasValue()) currentValue = event.value()
      if (!event.isNext()) return

      lock++
      instance.set(keypath, currentValue)
      lock--
    })

    return {
      get () {
        return currentValue
      },
      set (value) {

      },
      reset (value) {
        if (lock !== 0) return
        if (isObservable(value)) return false
        if (isObserver(observable)) return observable.push(value)
      },
      teardown () {
        unsubscribe()
      }
    }
  }
}
