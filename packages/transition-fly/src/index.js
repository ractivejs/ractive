const defaults = {
  duration: 400,
  easing: 'easeOut',
  opacity: 0,
  x: -500,
  y: 0
}

const addPx = num => (num === 0 || typeof num === 'string') ? num : `${num}px`

export default function fly (t, params) {
  const options = t.processParams(params, defaults)
  const x = addPx(options.x)
  const y = addPx(options.y)
  const offscreen = { transform: `translate(${x},${y})`, opacity: 0 }
  const target = t.isIntro ? t.getStyle(['opacity', 'transform']) : offscreen

  if (t.isIntro) t.setStyle(offscreen)

  t.animateStyle(target, options).then(t.complete)
}
