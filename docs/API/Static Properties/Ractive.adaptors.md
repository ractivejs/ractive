---
title: Ractive.adaptors
---
{{{createLink 'Adaptors'}}} are a way of teaching Ractive to communicate with other libraries, such as Backbone.

`Ractive.adaptors` is a registry of globally available adaptors. When you create a Ractive instance with adaptors, you can pass in a reference to the adaptor itself, or the name of an adaptor on `Ractive.adaptors`:

```js
// this...
var ractive = new Ractive({
  el: container,
  template: myTemplate,
  data: myBackboneModel,
  adaptors: [ 'Backbone' ]
});

// ...is equivalent to this
var ractive = new Ractive({
  el: container,
  template: myTemplate,
  data: myBackboneModel,
  adaptors: [ Ractive.adaptors.Backbone ]
});
```