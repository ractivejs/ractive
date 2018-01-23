import { module, test } from 'qunit'
import Ractive from '@ractivejs/core'
import { Model } from 'ampersand'
import { modelAdaptor } from '@ractivejs/adaptor-ampersand'

module('adaptor-ampersand models')

Ractive.DEBUG = false

test('Adaptor can detect models', t => {
  t.ok(modelAdaptor.filter(new Model()))
})

test('Initialize with pre-filled model', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel({ message: 'hello' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model },
    template: `{{ model.message }}`
  })

  t.strictEqual(instance.get('model'), model)
  t.deepEqual(instance.get('model', { unwrap: false }), { message: 'hello' })
  t.strictEqual(instance.get('model.message'), 'hello')
  t.strictEqual(instance.toHTML(), 'hello')
})

test('Initialize with empty model', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel()
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model },
    template: `{{ model.message }}`
  })

  model.set('message', 'hello')

  t.strictEqual(instance.get('model'), model)
  t.deepEqual(instance.get('model', { unwrap: false }), { message: 'hello' })
  t.strictEqual(instance.get('model.message'), 'hello')
  t.strictEqual(instance.toHTML(), 'hello')
})

test('Initialize with set model', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel({ message: 'hello' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    template: `{{ model.message }}`
  })

  instance.set('model', model)

  t.strictEqual(instance.get('model'), model)
  t.deepEqual(instance.get('model', { unwrap: false }), { message: 'hello' })
  t.strictEqual(instance.get('model.message'), 'hello')
  t.strictEqual(instance.toHTML(), 'hello')
})

test('Updating via keypath', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel({ message: 'hello ' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model },
    template: `{{ model.message }}`
  })

  instance.set('model.message', 'world')

  t.strictEqual(model.get('message'), 'world')
  t.strictEqual(instance.get('model.message'), 'world')
  t.strictEqual(instance.toHTML(), 'world')
})

test('Updating via model', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel({ message: 'hello' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model },
    template: `{{ model.message }}`
  })

  model.set('message', 'world')

  t.strictEqual(model.get('message'), 'world')
  t.strictEqual(instance.get('model.message'), 'world')
  t.strictEqual(instance.toHTML(), 'world')
})

test('Updating keypath triggers model listeners', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel({ message: 'hello' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model }
  })

  model.on('change:message', () => { t.strictEqual(model.get('message'), 'world') })

  instance.set('model.message', 'world')
})

test('Updating model triggers observers', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel({ message: 'hello' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model }
  })

  instance.observe('model.message', v => {
    t.strictEqual(v, 'world')
  }, { init: false })

  instance.set('model.message', 'world')
})

test('Resetting model with a POJO', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel({ message: 'hello' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model },
    template: `{{ model.message }}`
  })

  instance.set('model', { message: 'world' })

  t.strictEqual(model.get('message'), 'world')
  t.strictEqual(instance.get('model'), model)
  t.deepEqual(instance.get('model', { unwrap: false }), { message: 'world' })
  t.strictEqual(instance.get('model.message'), 'world')
  t.strictEqual(instance.toHTML(), 'world')
})

test('Resetting model with a new MyModel', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const oldModel = new MyModel({ message: 'hello' })
  const newModel = new MyModel({ message: 'world' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model: oldModel },
    template: `{{ model.message }}`
  })

  instance.set('model', newModel)

  // Holds new MyModel
  t.strictEqual(instance.get('model'), newModel)
  t.deepEqual(instance.get('model', { unwrap: false }), { message: 'world' })
  t.strictEqual(instance.get('model.message'), 'world')
  t.strictEqual(instance.toHTML(), 'world')

  // Stops listening to old model and listens to the new MyModel
  oldModel.set('message', 'foo')
  newModel.set('message', 'bar')
  t.strictEqual(instance.get('model.message'), 'bar')

  // Stops setting to the old model and sets to the new MyModel
  instance.set('model.message', 'qux')
  t.strictEqual(oldModel.get('message'), 'foo')
  t.strictEqual(newModel.get('message'), 'qux')
})

test('Resetting model with a non-adapted value', t => {
  const MyModel = Model.extend({ props: { message: 'string' } })
  const model = new MyModel({ message: 'hello' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model },
    template: `{{ model }}`
  })

  instance.set('model', 1)

  t.strictEqual(instance.get('model'), 1)
  t.strictEqual(instance.toHTML(), '1')

  // Preserves last value of model
  t.strictEqual(model.get('message'), 'hello')
})
