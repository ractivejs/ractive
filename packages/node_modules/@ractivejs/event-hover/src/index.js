const isEnterLeaveAvailable = document && document.createElement('div').onmouseenter !== undefined
const inEvent = isEnterLeaveAvailable ? 'mouseenter' : 'mouseover'
const outEvent = isEnterLeaveAvailable ? 'mouseleave' : 'mouseout'

const createHandler = (node, fire, hoverValue) => event => {
  if (!isEnterLeaveAvailable && node.contains(event.relatedTarget)) return
  fire({ hover: hoverValue })
}

const createEvent = options => (node, fire) => {
  if (typeof document === 'undefined') return

  let inHandler, outHandler

  if (options.in) node.addEventListener(inEvent, inHandler = createHandler(node, fire, true), false)
  if (options.out) node.addEventListener(outEvent, outHandler = createHandler(node, fire, false), false)

  return {
    teardown () {
      if (options.in) node.removeEventListener(inEvent, inHandler, false)
      if (options.out) node.removeEventListener(outEvent, outHandler, false)
    }
  }
}

export const hover = createEvent({ in: true, out: true })
export const hoverin = createEvent({ in: true, out: false })
export const hoverout = createEvent({ in: false, out: true })
