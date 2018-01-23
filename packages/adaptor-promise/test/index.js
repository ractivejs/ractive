import { module, test } from 'qunit'
import Ractive from '@ractivejs/core'
import Adaptor from '@ractivejs/adaptor-promise'

module('ractive-adaptor-promise')

test('A pending promise does not have any value', assert => {
  const promise = new Promise((resolve, reject) => {})
  const instance = Ractive({
    el: '#qunit-fixture',
    template: '<p>{{ value }}</p>',
    data: { value: promise },
    adapt: [ Adaptor ]
  })

  assert.strictEqual(instance.get('value'), promise)
  assert.strictEqual(instance.get('value', { unwrap: false }), null)
  assert.strictEqual(instance.find('p').innerHTML, '')
})

test('Resolving with a primitive value', assert => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), 1000)
  })
  const instance = Ractive({
    el: '#qunit-fixture',
    template: '<p>{{ value }}</p>',
    data: { value: promise },
    adapt: [ Adaptor ]
  })

  return promise.then(value => {
    assert.strictEqual(instance.get('value'), 1)
    assert.strictEqual(instance.get('value', { unwrap: false }), 1)
    assert.strictEqual(instance.find('p').innerHTML, '1')
  })
})

test('Resolving with a non-primitive value', assert => {
  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve({ foo: 1 }), 1000)
  })

  const instance = Ractive({
    el: '#qunit-fixture',
    template: '<p>{{ value.foo }}</p>',
    data: { value: promise },
    adapt: [ Adaptor ]
  })

  return promise.then(value => {
    assert.strictEqual(instance.get('value.foo'), 1)
    assert.strictEqual(instance.get('value.foo', { unwrap: false }), 1)
    assert.strictEqual(instance.find('p').innerHTML, '1')
  })
})

test('Rejecting with a primitive value', assert => {
  const promise = new Promise((resolve, reject) => {
    // eslint-disable-next-line
    setTimeout(() => reject(1), 1000)
  })
  const instance = Ractive({
    el: '#qunit-fixture',
    template: '<p>{{ value }}</p>',
    data: { value: promise },
    adapt: [ Adaptor ]
  })

  return promise.then(() => {}, value => {
    assert.strictEqual(instance.get('value'), 1)
    assert.strictEqual(instance.get('value', { unwrap: false }), 1)
    assert.strictEqual(instance.find('p').innerHTML, '1')
  })
})

test('Rejecting with a non-primitive value', assert => {
  const promise = new Promise((resolve, reject) => {
    // eslint-disable-next-line
    setTimeout(() => reject({ foo: 1 }), 1000)
  })

  const instance = Ractive({
    el: '#qunit-fixture',
    template: '<p>{{ value.foo }}</p>',
    data: { value: promise },
    adapt: [ Adaptor ]
  })

  return promise.then(() => {}, value => {
    assert.strictEqual(instance.get('value.foo'), 1)
    assert.strictEqual(instance.get('value.foo', { unwrap: false }), 1)
    assert.strictEqual(instance.find('p').innerHTML, '1')
  })
})
