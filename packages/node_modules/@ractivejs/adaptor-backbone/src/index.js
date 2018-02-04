import Backbone from 'backbone'

export const modelAdaptor = {
  filter (object) {
    return object instanceof Backbone.Model
  },
  wrap (instance, model, keypath, prefix) {
    let lock = 0
    const changeHandler = () => {
      lock++
      instance.set(prefix(model.changed))
      lock--
    }

    model.on('change', changeHandler)

    return {
      get () {
        return model.toJSON()
      },
      set (keypath, value) {
        if (lock !== 0 || keypath.indexOf('.') !== -1) return

        model.set(keypath, value)
      },
      reset (value) {
        if (lock !== 0) return
        if (value instanceof Backbone.Model || !(value instanceof Object)) return false

        model.set(value)
      },
      teardown () {
        model.off('change', changeHandler)
      }
    }
  }
}

export const collectionAdaptor = {
  filter (object) {
    return object instanceof Backbone.Collection
  },
  wrap (instance, collection, keypath, prefix) {
    let lock = 0
    const changeHandler = () => {
      lock++
      instance.set(keypath, collection.models)
      lock--
    }

    collection.on('add remove reset sort', changeHandler)

    return {
      get () {
        return collection.models
      },
      set () {

      },
      reset (models) {
        if (lock !== 0) return
        if (models instanceof Backbone.Collection || !Array.isArray(models)) return false

        collection.reset(models)
      },
      teardown () {
        collection.off('add remove reset sort', changeHandler)
      }
    }
  }
}
