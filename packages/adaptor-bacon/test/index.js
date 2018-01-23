import { module, test } from 'qunit'
import Ractive from '@ractivejs/core'
import Bacon from 'baconjs'
import Adaptor from '@ractivejs/adaptor-bacon'

module('adaptor-bacon')

test('Adaptor can detect an observable', t => {
  t.ok(Adaptor.filter(new Bacon.Observable()))
  t.ok(Adaptor.filter(new Bacon.EventStream(() => {})))
  t.ok(Adaptor.filter(new Bacon.Property('prop', () => {})))
  t.ok(Adaptor.filter(new Bacon.Bus()))
})

test('Initialize using a Property', t => {
  const observable = Bacon.constant('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})

test('Initialize using a Bus', t => {
  const observable = new Bacon.Bus()
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')
})

test('Initialize using a set Property', t => {
  const observable = Bacon.constant('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    template: `{{ observable }}`
  })

  instance.set('observable', observable)

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})

test('Initialize using a set Bus', t => {
  const observable = new Bacon.Bus()
  const instance = Ractive({
    adapt: [ Adaptor ],
    template: `{{ observable }}`
  })

  instance.set('observable', observable)

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')
})

test('Bus updates Ractive', t => {
  const observable = new Bacon.Bus()
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')

  observable.push('foo')

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'foo')
  t.strictEqual(instance.toHTML(), 'foo')
})

test('Ractive should not update Property', t => {
  const observable = Bacon.constant('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')

  instance.set('observable', 'foo')

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})

test('Ractive updates Bus', t => {
  const observable = new Bacon.Bus()
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  observable.subscribe(event => {
    if (!event.hasValue()) return
    t.strictEqual(event.value(), 'foo')
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')

  instance.set('observable', 'foo')

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'foo')
  t.strictEqual(instance.toHTML(), 'foo')
})

test('Resetting with an Observable', t => {
  const oldObservable = Bacon.constant('hello')
  const newObservable = Bacon.constant('world')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable: oldObservable },
    template: `{{ observable }}`
  })

  const results = ['world', 'foo']
  let count = 0

  newObservable.subscribe(event => {
    if (!event.hasValue()) return
    t.strictEqual(event.value(), results[count++])
  })

  t.strictEqual(instance.get('observable'), oldObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'hello')
  t.strictEqual(instance.toHTML(), 'hello')

  instance.set('observable', newObservable)

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'world')
  t.strictEqual(instance.toHTML(), 'world')

  instance.set('observable', 'foo')

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'world')
  t.strictEqual(instance.toHTML(), 'world')
})

test('Resetting with an Observer', t => {
  const oldObservable = new Bacon.Bus()
  const newObservable = new Bacon.Bus()
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable: oldObservable },
    template: `{{ observable }}`
  })

  const results = ['bar', 'qux']
  let count = 0

  newObservable.subscribe(event => {
    if (!event.hasValue()) return
    t.strictEqual(event.value(), results[count++])
  })

  t.strictEqual(instance.get('observable'), oldObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')

  instance.set('observable', newObservable)

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')

  oldObservable.push('foo')
  newObservable.push('bar')

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'bar')
  t.strictEqual(instance.toHTML(), 'bar')

  instance.set('observable', 'qux')

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})
