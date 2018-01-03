import { module, test } from 'qunit'
import Backbone from 'backbone'
import Ractive from '@ractivejs/core'
import { modelAdaptor } from '@ractivejs/adaptor-backbone'

module('ractive-adaptor-backbone models')

test('Adaptor can detect models', t => {
  t.ok(modelAdaptor.filter(new Backbone.Model()))
})

test('Initialize with pre-filled model', t => {
  const model = new Backbone.Model({ message: 'hello' })
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
  const model = new Backbone.Model()
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
  const model = new Backbone.Model({ message: 'hello' })
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
  const model = new Backbone.Model({ message: 'hello ' })
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
  const model = new Backbone.Model({ message: 'hello' })
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
  const model = new Backbone.Model({ message: 'hello' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model }
  })

  model.on('change:message', () => { t.strictEqual(model.get('message'), 'world') })

  instance.set('model.message', 'world')
})

test('Updating model triggers observers', t => {
  const model = new Backbone.Model({ message: 'hello' })
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
  const model = new Backbone.Model({ message: 'hello' })
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

test('Resetting model with a new model', t => {
  const oldModel = new Backbone.Model({ message: 'hello' })
  const newModel = new Backbone.Model({ message: 'world' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model: oldModel },
    template: `{{ model.message }}`
  })

  instance.set('model', newModel)

  // Holds new model
  t.strictEqual(instance.get('model'), newModel)
  t.deepEqual(instance.get('model', { unwrap: false }), { message: 'world' })
  t.strictEqual(instance.get('model.message'), 'world')
  t.strictEqual(instance.toHTML(), 'world')

  // Stops listening to old model and listens to the new model
  oldModel.set('message', 'foo')
  newModel.set('message', 'bar')
  t.strictEqual(instance.get('model.message'), 'bar')

  // Stops setting to the old model and sets to the new model
  instance.set('model.message', 'qux')
  t.strictEqual(oldModel.get('message'), 'foo')
  t.strictEqual(newModel.get('message'), 'qux')
})

test('Resetting model with a non-adapted value', t => {
  const model = new Backbone.Model({ message: 'hello' })
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

test('Override model.toJSON to customize POJO representation', t => {
  const ExtendedModel = Backbone.Model.extend({
    toJSON () {
      return { fullName: this.attributes.firstName + ' ' + this.attributes.lastName }
    }
  })
  const model = new ExtendedModel({ firstName: 'Jane', lastName: 'Doe' })
  const instance = Ractive({
    adapt: [ modelAdaptor ],
    data: { model },
    template: `{{ model.fullName }}`
  })

  t.strictEqual(instance.get('model.fullName'), 'Jane Doe')
  t.strictEqual(instance.toHTML(), 'Jane Doe')
})