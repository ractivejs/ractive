import pointer from './hooks/pointer'
import touch from './hooks/touch'
import mouse from './hooks/mouse'
import focus from './hooks/focus'

// Select what tap method to use depending on device support
const tapSetup = 'PointerEvent' in window ? pointer
  : 'TouchEvent' in window ? touch
  : mouse

// Tap is a combination of pointer/touch/mouse and a spacebar tap
const tap = (node, fire) => {
  const isButtonLike = node.tagName === 'BUTTON' || node.type === 'button'
  const pointerDecorator = tapSetup(node, fire)
  const focusDecorator = isButtonLike ? focus(node, fire) : null

  return {
    teardown () {
      pointerDecorator.teardown()
      if (focusDecorator) focusDecorator.teardown()
    }
  }
}

export { tap, pointer, touch, mouse, focus }
