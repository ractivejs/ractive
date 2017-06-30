import { logIfDebug, warnIfDebug, warnOnceIfDebug } from '../utils/log'
import { getElement } from '../utils/dom'
import { toPairs } from '../utils/object'
import config from './config/config'
import Fragment from '../view/Fragment'
import Hook from '../events/Hook'
import HookQueue from '../events/HookQueue'
import Ractive from '../Ractive'

const configHook = new Hook('config')
const initHook = new HookQueue('init')

export default function initialise (ractive, userOptions, options) {
  Object.keys(ractive.viewmodel.computations).forEach(key => {
    const computation = ractive.viewmodel.computations[ key ]

    if (ractive.viewmodel.value.hasOwnProperty(key)) {
      computation.set(ractive.viewmodel.value[ key ])
    }
  })

  // set up event subscribers
  subscribe(ractive, userOptions, 'on')

  // init config from Parent and options
  config.init(ractive.constructor, ractive, userOptions)

  configHook.fire(ractive)

  // general config done, set up observers
  subscribe(ractive, userOptions, 'observe')

  initHook.begin(ractive)

  const fragment = ractive.fragment = createFragment(ractive, options)
  if (fragment) fragment.bind(ractive.viewmodel)

  initHook.end(ractive)

  if (fragment) {
    // render automatically ( if `el` is specified )
    const el = getElement(ractive.el || ractive.target)
    if (el) {
      const promise = ractive.render(el, ractive.append)

      if (Ractive.DEBUG_PROMISES) {
        promise.catch(err => {
          warnOnceIfDebug('Promise debugging is enabled, to help solve errors that happen asynchronously. Some browsers will log unhandled promise rejections, in which case you can safely disable promise debugging:\n  Ractive.DEBUG_PROMISES = false;')
          warnIfDebug('An error happened during rendering', { ractive })
          logIfDebug(err)

          throw err
        })
      }
    }
  }
}

export function createFragment (ractive, options = {}) {
  if (ractive.template) {
    let cssIds

    if (options.cssIds || ractive.cssId) {
      cssIds = options.cssIds ? options.cssIds.slice() : []

      if (ractive.cssId) {
        cssIds.push(ractive.cssId)
      }
    }

    return new Fragment({
      owner: ractive,
      template: ractive.template,
      cssIds
    })
  }
}

function subscribe (instance, options, type) {
  const subs = (instance.constructor[ `_${type}` ] || []).concat(toPairs(options[ type ] || []))
  const single = type === 'on' ? 'once' : `${type}Once`

  subs.forEach(([ target, config ]) => {
    if (typeof config === 'function') {
      instance[type](target, config)
    } else if (typeof config === 'object' && typeof config.handler === 'function') {
      instance[ config.once ? single : type ](target, config.handler, config)
    }
  })
}
