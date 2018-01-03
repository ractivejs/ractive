const props = [
  'width',
  'height',
  'visibility'
]

const defaults = {

}

const typewriteNode = (node, isIntro, complete, interval) => {
  if (node.nodeType === 1 && isIntro) {
    node.style.display = node._display
    node.style.width = node._width
    node.style.height = node._height
  }

  if (node.nodeType === 3) {
    typewriteTextNode(node, isIntro, complete, interval)
    return
  }

  const children = Array.prototype.slice.call(node.childNodes)
  const method = isIntro ? 'shift' : 'pop'
  const next = () => {
    if (!children.length) {
      if (node.nodeType === 1 && isIntro) {
        if (node._style) {
          node.setAttribute('style', node._style)
        } else {
          node.getAttribute('style')
          node.removeAttribute('style')
        }
      }

      complete()
      return
    }

    typewriteNode(children[method](), isIntro, next, interval)
  }

  next()
}

const typewriteTextNode = (node, isIntro, complete, interval) => {
  // text node
  const str = isIntro ? node._hiddenData : '' + node.data
  const len = str.length

  if (!len) {
    complete()
    return
  }

  let i = isIntro ? 0 : len
  let d = isIntro ? 1 : -1
  const targetLen = isIntro ? len : 0

  const loop = setInterval(() => {
    const substr = str.substr(0, i)
    const remaining = str.substring(i)
    const match = /^\w+/.exec(remaining)
    const remainingNonWhitespace = (match ? match[0].length : 0)

    // add some non-breaking whitespace corresponding to the remaining length of the
    // current word (only really works with monospace fonts, but better than nothing)
    const filler = new Array(remainingNonWhitespace + 1).join('\u00a0')

    node.data = substr + filler
    if (i === targetLen) {
      clearInterval(loop)
      delete node._hiddenData
      complete()
    }

    i += d
  }, interval)
}

// TODO differentiate between intro and outro
export default function typewriter (t, params) {
  const options = t.processParams(params, defaults)

  // Find the interval between each character. Default
  // to 4 milliseconds
  const interval = options.interval || (options.speed ? 1000 / options.speed : (options.duration ? t.node.textContent.length / options.duration : 4))

  const currentStyle = t.getStyle(props)

  const hide = node => {
    if (node.nodeType === 1) {
      node._style = node.getAttribute('style')
      let computedStyle = window.getComputedStyle(node)
      node._display = computedStyle.display
      node._width = computedStyle.width
      node._height = computedStyle.height
    }

    if (node.nodeType === 3) {
      node._hiddenData = '' + node.data
      node.data = ''

      return
    }

    const children = Array.prototype.slice.call(node.childNodes)
    for (let i = children.length; i--;) {
      hide(children[i])
    }

    node.style.display = 'none'
  }

  if (t.isIntro) {
    hide(t.node)
  }

  setTimeout(function () {
    // make style explicit...
    t.setStyle(currentStyle)

    typewriteNode(t.node, t.isIntro, t.complete, interval)
  }, options.delay || 0)
}
