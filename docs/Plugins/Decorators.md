A decorator is a simple way to add behaviour to a node when it is rendered, or to augment it in some way. Decorators are a good way to integrate DOM manipulation libraries with Ractive, such as [jQuery UI](http://jqueryui.com/) or [Bootstrap](https://getbootstrap.com/).

# Writing decorators

```js
function MyDecorator(node[, ...args]) {
  // Setup code
  return {
    teardown: function(){
      // Cleanup code
    },
    update: function([...args]){
      // Update code
    }
  };
};
```

Decorators are simply functions that are called upon to setup the decorator once Ractive detects its use. It takes a `node` argument and returns an object with a `teardown` and `update` property.

`node` is the element to which the decorator is applied to.

`args` are optional arguments provided by the decorator directive.

`teardown` is a function that gets called when the decorator is torn down.

`update` is an optional function that gets called when the arguments update.

Any updates to the arguments will cause the decorator function to fire with the updated arguments. If an `update` function is provided on the object returned, that will fire instead of the entire decorator function.

# Registering decorators

Like other plugins, there's 3 ways you can register decorators:

Globally via the `Ractive.decorators` static property.

```js
Ractive.decorators.mydecorator = MyDecorator;
```

Per component via the component's `decorators` initialization property.

```js
const MyComponent = Ractive.extend({
  decorators: {
    mydecorator: MyDecorator
  }
});
```

Or via the instance's `decorators` initialization property.

```js
const ractive = new Ractive({
  decorators: {
    mydecorator: MyDecorator
  }
});
```

# Using decorators

You can invoke one or more decorators on your elements by using a decorator directive. Arguments are optional. Argument-less decorators can simply use the directive without value. Decorators with arguments take a comma-separated set of expressions resolve to the element's context.

```html
<!-- without arguments -->
<div as-mydecorator>...</div>

<!-- with arguments -->
<div as-mydecorator="arg1, .some.other.arg2, 10 * @index" as-somethingElseToo>...</div>
```

# Examples

The following example builds a decorator that updates the time.

```js
Ractive.decorators.timer = function(node, time) {
  node.innerHTML = 'Hello World!';

  return {
    teardown: function() {
      node.innerHTML = '';
    },
    update: function(time) {
      node.innerHTML = time;
    }
  }
};

const ractive = new Ractive({
  el: 'body',
  template: `
    <span as-timer="time"></span>
  `,
  data: {
    time: 0
  }
});

setInterval(function() {
  ractive.set('time', Date.now())
}, 1000);
```
