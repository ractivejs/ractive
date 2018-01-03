import Ractive from 'ractive'

let ractive, sourceKeypath, sourceArray

const targetClass = 'droptarget'
const errorMessage = 'The sortable decorator only works with elements that correspond to array members'
const preventDefault = event => { event.preventDefault() }

const dragstartHandler = function (event) {
  const context = Ractive.getContext(this)

  // If we're not dragging something from an array, abort.
  if (!Array.isArray(context.get('../'))) throw new Error(errorMessage)

  // Track the instance, the item and the containing array.
  ractive = context.ractive
  sourceKeypath = context.resolve()
  sourceArray = context.resolve('../')

  // enables dragging in FF. go figure
  event.dataTransfer.setData('foo', true)
}

const dragenterHandler = function () {
  const context = Ractive.getContext(this)

  // If the last tracked instance isn't the one firing this event, abort.
  if (context.ractive !== ractive) return

  const targetKeypath = context.resolve()
  const targetArray = context.resolve('../')

  // If we're dealing with a different array, abort.
  if (targetArray !== sourceArray) return

  // If we're hovering over our destination, add the class and abort.
  // (The dragged element has already moved in the DOM when this happens)
  if (targetKeypath === sourceKeypath) {
    this.classList.add(targetClass)
    return
  }

  // If we're hovering on a neighbor element, switch places.
  const source = ractive.get(sourceKeypath)

  // Remove source from array
  const sourceSegments = Ractive.splitKeypath(sourceKeypath)
  const sourceIndex = sourceSegments[sourceSegments.length - 1]
  ractive.splice(targetArray, sourceIndex, 1)

  // The target index is now the source
  sourceKeypath = targetKeypath

  // Add source back to array in new location
  const targetSegments = Ractive.splitKeypath(targetKeypath)
  const targetIndex = targetSegments[targetSegments.length - 1]
  ractive.splice(targetArray, targetIndex, 0, source)
}

const removeTargetClass = function () {
  this.classList.remove(targetClass)
}

export default function sortable (node) {
  node.draggable = true

  node.addEventListener('dragstart', dragstartHandler, false)
  node.addEventListener('dragenter', dragenterHandler, false)
  node.addEventListener('dragleave', removeTargetClass, false)
  node.addEventListener('drop', removeTargetClass, false)

  // necessary to prevent animation where ghost element returns
  // to its (old) home
  node.addEventListener('dragover', preventDefault, false)

  return {
    teardown () {
      node.removeEventListener('dragstart', dragstartHandler, false)
      node.removeEventListener('dragenter', dragenterHandler, false)
      node.removeEventListener('dragleave', removeTargetClass, false)
      node.removeEventListener('drop', removeTargetClass, false)
      node.removeEventListener('dragover', preventDefault, false)
    }
  }
}
