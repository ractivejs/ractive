const createKeydownHandler = (code, fire) => event => {
  const which = event.which || event.keyCode
  if (which !== code) return
  event.preventDefault()
  fire()
}

const makeKeyDefinition = code => (node, fire) => {
  const handler = createKeydownHandler(code, fire)

  node.addEventListener('keydown', handler, false)

  return {
    teardown () {
      node.removeEventListener('keydown', handler, false)
    }
  }
}

export const enter = makeKeyDefinition(13)
export const tab = makeKeyDefinition(9)
export const escape = makeKeyDefinition(27)
export const space = makeKeyDefinition(32)
export const leftarrow = makeKeyDefinition(37)
export const rightarrow = makeKeyDefinition(39)
export const downarrow = makeKeyDefinition(40)
export const uparrow = makeKeyDefinition(38)
