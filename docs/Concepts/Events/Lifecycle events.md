---
title: 'Lifecycle events'
---

Every Ractive instance has a *lifecycle* - it is created, then rendered, and eventually may be changed and 'torn down'. You can subscribe to these *lifecycle events* using {{{createLink 'ractive.on()'}}}:


```js
ractive = new Ractive({
  el: 'body',
  template: myTemplate
});

ractive.on( 'teardown', function () {
  alert( 'Bye!' );
});
```

You can also add handlers as {{{createLink 'Options' 'initialisation options'}}}:

```js
ractive = new Ractive({
  el: 'body',
  template: myTemplate,
  onteardown: function () {
    alert( 'Bye!' );
  }
});
```

The full list of lifecycle events is as follows:

| Name            | Event is fired...
| --------------- | --------------
| `construct`     | ...as soon as `new Ractive(...)` happens, before any setup work takes place
| `config`        | ...once all configuration options have been processed
| `init`          | ...when the instance is ready to be rendered
| `render`        | ...each time the instance is rendered (normally only once)
| `complete`      | ...after `render`, once any intro {{{createLink 'transitions'}}} have completed
| `change`        | ...when data changes
| `update`        | ...after `ractive.update()` is called
| `unrender`      | ...each time the instance is unrendered
| `teardown`      | ...each time the instance is destroyed (after `unrender`, if the teardown is responsible for triggering the unrender)
| `insert`        | ...each time `ractive.insert()` is called
| `detach`        | ...each time `ractive.detach()` is called (note: `ractive.insert()` calls `ractive.detach()`)

<br>
Most of the events do not have arguments, except for:

* `construct` supplies the actual initialisation options provided to the instance constructor
* `change` supplies a change object with each change keypath as a property and the new change value as the value of that property

## Reserved event names

Note: the built-in lifecycle events are **reserved**, which means you can't use their names as {{{createLink 'proxy events'}}}.

