import { timeToLongPress, movedTooFar } from '../configs'

export default function mouse (node, fire) {
  const mousedownHandler = event => {
    if (event.which !== undefined && event.which !== 1) return

    const x = event.clientX
    const y = event.clientY

    const clickHandler = event => {
      fire(event, x, y)
      cancel()
    }

    const mousemoveHandler = event => {
      if (movedTooFar(x, y, event.clientX, event.clientY)) cancel()
    }

    const cancel = () => {
      node.removeEventListener('click', clickHandler, false)
      document.removeEventListener('mousemove', mousemoveHandler, false)
    }

    node.addEventListener('click', clickHandler, false)
    document.addEventListener('mousemove', mousemoveHandler, false)

    setTimeout(cancel, timeToLongPress)
  }

  node.addEventListener('mousedown', mousedownHandler, false)

  return {
    teardown () {
      node.removeEventListener('mousedown', mousedownHandler, false)
    }
  }
}
