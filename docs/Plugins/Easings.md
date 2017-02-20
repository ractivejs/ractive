Easing functions are used by `ractive.animate` and in some transitions. They describe the animation's progression from start to finish.

# Writing easing functions

Easing functions are simply functions that accept one argument, a numeric value `x` between 0 and 1 representing progress along a timeline. The function must return a numeric `y` value to represent magnitude.

# Registering easing functions

Like other plugins, there's 3 ways you can register an easing function:

Globally via the `Ractive.easing` static property.

```js
Ractive.easing.MyEasingFunction = function(){ ... };
```

Per component via the component's `easing` initialization property.

```js
const MyComponent = Ractive.extend({
  easing: {
    MyEasingFunction: function(){ ... }
  }
});
```

Or via the instance's `easing` initialization property.

```js
const ractive = new Ractive({
  easing: {
    MyEasingFunction: function(){ ... }
  }
});
```

# Using easing functions

Easing functions don't work alone. They are utilized by [`ractive.animate()`]() and [Transitions]() to dictate animations.

```js
ractive.animate('foo.bar', 1, {
  easing: 'MyEasingFunction'
});
```

# Examples

Here's an `elastic` easing function taken from [danro](https://github.com/danro)'s excellent [easing.js](https://github.com/danro/easing-js/blob/master/easing.js) library.

```js
Ractive.easing.elastic = function ( x ) {
  return -1 * Math.pow(4,-8*x) * Math.sin((x*6-1)*(2*Math.PI)/2) + 1;
};
```
