export default function focus (node, fire) {
  const keydownHandler = event => {
    if (event.which !== 32) return
    const { x, y } = event.target.getBoundingClientRect()
    fire(event, x, y)
  }

  const focusHandler = event => {
    node.addEventListener('keydown', keydownHandler, false)
    node.addEventListener('blur', blurHandler, false)
  }

  const blurHandler = event => {
    node.removeEventListener('keydown', keydownHandler, false)
    node.removeEventListener('blur', blurHandler, false)
  }

  node.addEventListener('focus', focusHandler, false)

  return {
    teardown () {
      node.removeEventListener('focus', focusHandler, false)
    }
  }
}
