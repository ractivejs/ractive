import { timeToLongPress, movedTooFar } from '../configs'

export default function pointer (node, fire) {
  const pointerdownHandler = event => {
    if (event.which !== undefined && event.which !== 1) return

    const pointerId = event.pointerId
    const x = event.clientX
    const y = event.clientY

    const pointerupHandler = event => {
      if (event.pointerId !== pointerId) return
      fire(event, x, y)
      pointercancelHandler()
    }

    const pointermoveHandler = event => {
      if (event.pointerId !== pointerId) return
      if (movedTooFar(x, y, event.clientX, event.clientY)) pointercancelHandler()
    }

    const pointercancelHandler = () => {
      node.removeEventListener('pointerup', pointerupHandler, false)
      document.removeEventListener('pointermove', pointermoveHandler, false)
      document.removeEventListener('pointercancel', pointercancelHandler, false)
    }

    node.addEventListener('pointerup', pointerupHandler, false)
    document.addEventListener('pointermove', pointermoveHandler, false)
    document.addEventListener('pointercancel', pointercancelHandler, false)

    setTimeout(pointercancelHandler, timeToLongPress)
  }

  node.addEventListener('pointerdown', pointerdownHandler, false)

  return {
    teardown () {
      node.removeEventListener('pointerdown', pointerdownHandler, false)
    }
  }
}
