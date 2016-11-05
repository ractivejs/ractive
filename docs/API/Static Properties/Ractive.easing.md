---
title: Ractive.easing
---
This is a set of globally available easing functions, which are used with {{{createLink 'ractive.animate()'}}} and in some {{{createLink 'transitions'}}}.

Four are included by default - `linear`, `easeIn`, `easeOut` and `easeInOut`.

You can easily add more. An easing function takes an `x` value, representing progress along a timeline (between 0 and 1), and returns a `y` value.

For example, here's an `elastic` easing function:

```js
Ractive.easing.elastic = function ( x ) {
  return -1 * Math.pow(4,-8*x) * Math.sin((x*6-1)*(2*Math.PI)/2) + 1;
};
```

This was taken from [danro](https://github.com/danro)'s excellent [easing.js](https://github.com/danro/easing-js/blob/master/easing.js) library - if you're a glutton for punishment, you could write your own easing functions, but this set covers pretty much all the bases.