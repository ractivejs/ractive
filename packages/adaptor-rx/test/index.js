import { module, test } from 'qunit'
import Ractive from '@ractivejs/core'
import Rx from '@reactivex/rxjs'
import Adaptor from '@ractivejs/adaptor-rx'

module('adaptor-rx')

test('Adaptor can detect an observable', t => {
  t.ok(Adaptor.filter(Rx.Observable.of('foo')))
  t.ok(Adaptor.filter(new Rx.Subject()))
  t.ok(Adaptor.filter(new Rx.BehaviorSubject('foo')))
})

test('Initialize using a regular Observable', t => {
  const observable = Rx.Observable.of('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})

test('Initialize using a Subject', t => {
  const observable = new Rx.Subject()
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')
})

test('Initialize using a BehaviorSubject', t => {
  const observable = new Rx.BehaviorSubject('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})

test('Initialize using a set regular Observable', t => {
  const observable = Rx.Observable.of('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    template: `{{ observable }}`
  })

  instance.set('observable', observable)

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})

test('Initialize using a set Subject', t => {
  const observable = new Rx.Subject()
  const instance = Ractive({
    adapt: [ Adaptor ],
    template: `{{ observable }}`
  })

  instance.set('observable', observable)

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')
})

test('Initialize using a set BehaviorSubject', t => {
  const observable = new Rx.BehaviorSubject('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    template: `{{ observable }}`
  })

  instance.set('observable', observable)

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})

test('Subject updates Ractive', t => {
  const observable = new Rx.Subject()
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')

  observable.next('foo')

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'foo')
  t.strictEqual(instance.toHTML(), 'foo')
})

test('BehaviorSubject updates Ractive', t => {
  const observable = new Rx.BehaviorSubject('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')

  observable.next('foo')

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'foo')
  t.strictEqual(instance.toHTML(), 'foo')
})

test('Ractive should not update Observable', t => {
  const observable = Rx.Observable.of('qux')
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

test('Ractive updates Subject', t => {
  const observable = new Rx.Subject()
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  observable.subscribe(v => t.strictEqual(v, 'foo'))

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), undefined)
  t.strictEqual(instance.toHTML(), '')

  instance.set('observable', 'foo')

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'foo')
  t.strictEqual(instance.toHTML(), 'foo')
})

test('Ractive updates BehaviorSubject', t => {
  const observable = new Rx.BehaviorSubject('qux')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable },
    template: `{{ observable }}`
  })

  const results = ['qux', 'foo']
  let count = 0

  observable.subscribe(v => t.strictEqual(v, results[count++]))

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')

  instance.set('observable', 'foo')

  t.strictEqual(instance.get('observable'), observable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'foo')
  t.strictEqual(instance.toHTML(), 'foo')
})

test('Resetting with an Observable', t => {
  const oldObservable = Rx.Observable.of('hello')
  const newObservable = Rx.Observable.of('world')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable: oldObservable },
    template: `{{ observable }}`
  })

  t.strictEqual(instance.get('observable'), oldObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'hello')
  t.strictEqual(instance.toHTML(), 'hello')

  instance.set('observable', newObservable)

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'world')
  t.strictEqual(instance.toHTML(), 'world')
})

test('Resetting with an Observer', t => {
  const oldObservable = new Rx.BehaviorSubject('hello')
  const newObservable = new Rx.BehaviorSubject('world')
  const instance = Ractive({
    adapt: [ Adaptor ],
    data: { observable: oldObservable },
    template: `{{ observable }}`
  })

  const results = ['world', 'bar', 'qux']
  let count = 0

  newObservable.subscribe(v => t.strictEqual(v, results[count++]))

  t.strictEqual(instance.get('observable'), oldObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'hello')
  t.strictEqual(instance.toHTML(), 'hello')

  instance.set('observable', newObservable)

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'world')
  t.strictEqual(instance.toHTML(), 'world')

  oldObservable.next('foo')
  newObservable.next('bar')

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'bar')
  t.strictEqual(instance.toHTML(), 'bar')

  instance.set('observable', 'qux')

  t.strictEqual(instance.get('observable'), newObservable)
  t.strictEqual(instance.get('observable', { unwrap: false }), 'qux')
  t.strictEqual(instance.toHTML(), 'qux')
})
