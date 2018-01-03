const defaults = {
  delay: 0,
  duration: 300,
  easing: 'linear'
}

export default function fade (t, params) {
  const options = t.processParams(params, defaults)
  const targetOpacity = t.isIntro ? t.getStyle('opacity') : 0

  if (t.isIntro) t.setStyle('opacity', 0)

  t.animateStyle('opacity', targetOpacity, options).then(t.complete)
}
