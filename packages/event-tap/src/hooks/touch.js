import { timeToLongPress, movedTooFar } from '../configs'

export default function touch (node, fire) {
  const touchstartHandler = event => {
    const touch = event.touches[0]
    const finger = touch.identifier
    const x = touch.clientX
    const y = touch.clientY

    const handleTouchup = event => {
      if (event.changedTouches[0].identifier !== finger) {
        cancel()
        return
      }

      fire(event, x, y)
      cancel()
    }

    const handleTouchmove = event => {
      if (event.touches.length !== 1 || event.touches[0].identifier !== finger) cancel()

      const touch = event.touches[0]

      if (movedTooFar(x, y, touch.clientX, touch.clientY)) cancel()
    }

    const cancel = () => {
      node.removeEventListener('touchend', handleTouchup, false)
      window.removeEventListener('touchmove', handleTouchmove, false)
      window.removeEventListener('touchcancel', cancel, false)
    }

    node.addEventListener('touchend', handleTouchup, false)
    window.addEventListener('touchmove', handleTouchmove, false)
    window.addEventListener('touchcancel', cancel, false)

    setTimeout(cancel, timeToLongPress)
  }

  node.addEventListener('touchstart', touchstartHandler, false)

  return {
    teardown () {
      node.removeEventListener('touchstart', touchstartHandler, false)
    }
  }
}
