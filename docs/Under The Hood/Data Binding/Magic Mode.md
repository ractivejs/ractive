---
title: Magic mode
---
Normally, you would update data using {{{createLink 'ractive.set()'}}}, {{{createLink 'ractive.animate()'}}}, or the {{{createLink 'array-modification' 'array mutator methods'}}}.

If you're fortunate enough to be developing for modern browsers only, however, you have another option: magic mode. Magic mode uses ES5 accessors to allow you to do this:

```js
var model = { message: 'hello' };

var ractive = new Ractive({
  el: container,
  template: 'message: \{{message}}',
  magic: true,
  data: model
});

// instead of doing `ractive.set( 'message', 'goodbye' )`...
model.message = 'goodbye';
```

ES what?
--------

ECMAScript 5 is the current version of the language more commonly known as JavaScript. Most ES5 features are widely supported in all current browsers.

One feature in particular, `Object.defineProperty`, allows us to define *accessors*, which are functions that get called when you get or set the value of a property on an object. For those curious, [MDN has comprehensive docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty).

(If you have to support IE8, or particularly old versions of Firefox or Opera, you may as well stop reading unfortunately. There's a [compatibility table here](http://kangax.github.io/es5-compat-table/#Object.defineProperty). Don't be fooled by the 'yes' under IE8 - it's a broken implementation. Shocking, I know. Attempting to use magic mode in one of these browsers will cause Ractive to throw an error.)

Ractive, in magic mode, will *wrap* properties with accessors where necessary, saving you the work.


Why not to use it
-----------------

Aside from the compatibility issue, there is a performance implication to be aware of. Wrapping and unwrapping properties isn't completely free, and using accessors (instead of direct property access) has a slight cost as well.

In the vast majority of cases this won't matter - we're talking fractions of milliseconds - but if you're *really* into performance, you might want to use the explicit `ractive.set()` approach. (Of course, you can still use the explicit methods when you're in magic mode.)

Also, be aware that if you have a situation like this...

```html
<div style='color: \{{color}}; opacity: \{{opacity}};'>some content</div>
```

...then using `ractive.set({ color: 'red', opacity: 0.5 })` would only cause one DOM update, whereas `model.color = 'red'` followed by `model.opacity = 0.5` would cause two. Again, in most real-world situations that's not a problem.


Using magic mode with arrays
----------------------------

Magic mode only works with properties that Ractive already knows about. Which means that if you do this...

```html
<ul>
  \{{#items}}
    <li>\{{.}}</li>
  \{{/items}}
</ul>
```

```js
var items = [ 'a', 'b', 'c' ];

var ractive = new Ractive({
  el: container,
  template: myTemplate,
  magic: true,
  data: { items: items }
});
```

...you can't add items to the list by doing `items[3] = 'd'`, for example. Instead, do `items.push('d')`, so Ractive becomes aware of the `items[3]` property.
