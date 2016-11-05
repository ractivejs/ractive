---
title: ractive.updateModel()
---
If you programmatically manipulate inputs and other elements that have {{{createLink 'two‐way binding'}}} set up, your model can get out of sync. In these cases, we need to force a resync with `ractive.updateModel()`:

```js
ractive = new Ractive({
  el: 'container',
  template: '<input value="{{name}}">'
  data: { name: 'Bob' }
});

ractive.find( 'input' ).value = 'Jim';
alert( ractive.get( 'name' ) ); // alerts 'Bob', not 'Jim'

ractive.updateModel();
alert( ractive.get( 'name' ) ); // alerts 'Jim'
```

> ### ractive.updateModel( keypath [, cascade ])
> Returns a `Promise` (see {{{createLink 'Promises'}}})

> > #### **keypath** *`String`*
> > The keypath to treat as 'dirty'. Any two-way bindings linked to this keypath will be checked to see if the model is out of date
> > #### cascade *`Boolean`*
> > If true, bindings that are *downstream* of `keypath` will also be checked - e.g. `ractive.updateModel( 'items', true )` would check `items.0.foo` and `items.1.foo` and so on. Defaults to `false`.


> ### ractive.updateModel()
> Returns a `Promise` (see {{{createLink 'Promises'}}}). If a `keypath` is not specified, all two-way bindings will be checked.