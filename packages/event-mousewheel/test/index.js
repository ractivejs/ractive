import { module, test } from 'qunit'
import simulant from 'simulant'
import Ractive from '@ractivejs/core'
import { mousewheel } from '@ractivejs/event-mousewheel'

module('ractive-event-mousewheel')

const template = `
  <div class="outer" on-mousewheel="handler">
    <div class="inner"></div>
  </div>
`

const css = `
  .outer{ width: 100px; height: 100px; overflow:auto }
  .inner{ width: 100px; height: 200px }
`

test('Vertical scroll', t => {
  const instance = Ractive({
    el: '#qunit-fixture',
    events: { mousewheel },
    template,
    css,
    on: {
      handler (context) {
        t.strictEqual(context.dx, 0)
        t.strictEqual(context.dy, -50)
      }
    }
  })

  simulant.fire(instance.find('.outer'), 'wheel', { deltaY: 50, deltaMode: 0 })
})

test('Horizontal scroll', t => {
  const instance = Ractive({
    el: '#qunit-fixture',
    events: { mousewheel },
    template,
    css,
    on: {
      handler (context) {
        t.strictEqual(context.dx, -50)
        t.strictEqual(context.dy, 0)
      }
    }
  })

  simulant.fire(instance.find('.outer'), 'wheel', { deltaX: 50, deltaMode: 0 })
})
