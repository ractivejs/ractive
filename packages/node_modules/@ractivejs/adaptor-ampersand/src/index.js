const isModel = o => o && typeof o.getType === 'function' && o.getType() === o[o.typeAttribute]
const isCollection = o => o && o.isCollection

export const modelAdaptor = {
  filter (object) {
    return isModel(object)
  },
  wrap (instance, model, keypath, prefix) {
    let lock = 0
    const changeHandler = () => {
      lock++
      instance.set(prefix(model.changedAttributes()))
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
      reset (object) {
        if (lock !== 0) return
        if (isModel(object) || !(object instanceof Object)) return false

        model.set(object)
      },
      teardown () {
        model.off('change', changeHandler)
      }
    }
  }
}

export const collectionAdaptor = {
  filter (object) {
    return isCollection(object)
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
        if (isCollection(models) || !Array.isArray(models)) return false

        collection.reset(models)
      },
      teardown () {
        collection.off('add remove reset sort', changeHandler)
      }
    }
  }
}
