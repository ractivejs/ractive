import { module, test } from 'qunit'
import simulant from 'simulant'
import Ractive from '@ractivejs/core'
import {hover, hoverin, hoverout} from '@ractivejs/event-hover'

module('ractive-event-hover')

const isEnterLeaveAvailable = document.createElement('div').onmouseenter !== undefined
const inEvent = isEnterLeaveAvailable ? 'mouseenter' : 'mouseover'
const outEvent = isEnterLeaveAvailable ? 'mouseleave' : 'mouseout'

test('hover (in)', t => {
  const instance = Ractive({
    el: '#qunit-fixture',
    events: { hover },
    template: `<button on-hover="handler">Hover Me</button>`,
    on: {
      handler (context) {
        t.strictEqual(context.hover, true)
      }
    }
  })

  simulant.fire(instance.find('button'), inEvent)
})

test('hover (out)', t => {
  const instance = Ractive({
    el: '#qunit-fixture',
    events: { hover },
    template: `<button on-hover="handler">Hover Me</button>`,
    on: {
      handler (context) {
        t.strictEqual(context.hover, false)
      }
    }
  })

  simulant.fire(instance.find('button'), outEvent)
})

test('hoverin', t => {
  const instance = Ractive({
    el: '#qunit-fixture',
    events: { hoverin },
    template: `<button on-hoverin="handler">Hover Me</button>`,
    on: {
      handler () {
        t.ok(true)
      }
    }
  })

  simulant.fire(instance.find('button'), inEvent)
})

test('hoverout', t => {
  const instance = Ractive({
    el: '#qunit-fixture',
    events: { hoverout },
    template: `<button on-hoverout="handler">Hover Me</button>`,
    on: {
      handler () {
        t.ok(true)
      }
    }
  })

  simulant.fire(instance.find('button'), outEvent)
})
