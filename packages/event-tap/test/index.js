import { module, test } from 'qunit'
import simulant from 'simulant'
import Ractive from '@ractivejs/core'
import { tap, pointer, touch, mouse, focus } from '@ractivejs/event-tap'

module('ractive-event-tap')

test('tap as pointer', assert => {
  assert.expect(1)

  const instance = Ractive({
    el: '#qunit-fixture',
    events: { tap },
    template: '<span id="tappable" on-tap="tap">tap me</span>',
    on: {
      tap () {
        assert.ok(true)
      }
    }
  })

  const node = instance.find('#tappable')

  simulant.fire(node, 'pointerdown')
  simulant.fire(node, 'pointerup')
})

test('tap as focus', assert => {
  assert.expect(1)

  const instance = Ractive({
    el: '#qunit-fixture',
    events: { tap },
    template: '<button id="tappable" on-tap="tap">tap me</button>',
    on: {
      tap () {
        assert.ok(true)
      }
    }
  })

  const node = instance.find('#tappable')

  simulant.fire(node, 'focus')
  simulant.fire(node, 'keydown', { which: 32 })
})

// Because the adaptor picks the most appropriate event build tap, (in the
// case of Chrome Headless, pointer+focus), to test each variant we need to
// test them while used individually

test('pointerdown followed by pointerup', assert => {
  assert.expect(1)

  const instance = Ractive({
    el: '#qunit-fixture',
    events: { tap: pointer },
    template: '<span id="tappable" on-tap="tap">tap me</span>',
    on: {
      tap () {
        assert.ok(true)
      }
    }
  })

  const node = instance.find('#tappable')

  simulant.fire(node, 'pointerdown')
  simulant.fire(node, 'pointerup')
})

test('touchstart followed by touchend', assert => {
  assert.expect(1)

  const instance = Ractive({
    el: '#qunit-fixture',
    events: { tap: touch },
    template: '<span id="tappable" on-tap="tap">tap me</span>',
    on: {
      tap () {
        assert.ok(true)
      }
    }
  })

  const node = instance.find('#tappable')

  // simulant does not forge touches for us.
  const forgedTouch = new Touch({ identifier: 0, target: node })
  const touches = [ forgedTouch ]
  const changedTouches = [ forgedTouch ]

  simulant.fire(node, 'touchstart', { touches })
  simulant.fire(node, 'touchend', { touches, changedTouches })
})

test('mousedown followed by click', assert => {
  assert.expect(1)

  const instance = Ractive({
    el: '#qunit-fixture',
    events: { tap: mouse },
    template: '<span id="tappable" on-tap="tap">tap me</span>',
    on: {
      tap () {
        assert.ok(true)
      }
    }
  })

  const node = instance.find('#tappable')

  simulant.fire(node, 'mousedown')
  simulant.fire(node, 'click')
})

test('focus followed by keydown', assert => {
  assert.expect(1)

  const instance = new Ractive({
    el: '#qunit-fixture',
    events: { tap: focus },
    template: '<button id="tappable" on-tap="tap">tap me</button>',
    on: {
      tap () {
        assert.ok(true)
      }
    }
  })

  const node = instance.find('#tappable')

  simulant.fire(node, 'focus')
  simulant.fire(node, 'keydown', { which: 32 })
})