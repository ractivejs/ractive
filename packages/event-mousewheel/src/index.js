const isBrowser = typeof document !== 'undefined'
const isModernBrowser = isBrowser && ('onwheel' in document || document.documentMode >= 9)
const wheelEvents = ['mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll']

const modernPlugin = (node, fire) => {
  if (!isBrowser) return

  const handler = event => {
    const pixelScale = event.deltaMode === event.DOM_DELTA_LINE ? 40 : 1
    const dx = event.deltaX * -pixelScale
    const dy = event.deltaY * -pixelScale
    fire({ dx, dy })
  }

  node.addEventListener('wheel', handler, false)

  return {
    teardown () {
      node.removeEventListener('wheel', handler, false)
    }
  }
}

const legacyPlugin = (node, fire) => {
  if (!isBrowser) return

  const handler = event => {
    const isHorizontalScroll = event.axis !== undefined && event.axis === event.HORIZONTAL_AXIS

    const delta = event.wheelDelta ? event.wheelDelta
      : event.detail ? event.detail * -1
      : 0

    const dy = event.wheelDeltaY !== undefined ? event.wheelDeltaY / 3
      : isHorizontalScroll ? 0
      : delta

    const dx = event.wheelDeltaX !== undefined ? event.wheelDeltaX / 3
      : isHorizontalScroll ? delta * -1
      : 0

    fire({ dx, dy })
  }

  wheelEvents.forEach(event => node.addEventListener(event, handler, false))

  return {
    teardown: function () {
      wheelEvents.forEach(event => node.removeEventListener(event, handler, false))
    }
  }
}

export const mousewheel = isModernBrowser ? modernPlugin : legacyPlugin
