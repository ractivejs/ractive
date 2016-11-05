---
title: Adaptors
---

Adaptors are a way of teaching Ractive to communicate seamlessly with other libraries such as Backbone. This means that you can, for example, have some or all of your app's data handled by Backbone - including fetching from and saving to your server, validation, sorting, filtering and so on - but still build a reactive user interface using Ractive, without having to create custom View classes or adding a whole load of event binding code.

It's probably easier to show, rather than tell: [this example application](http://examples.ractivejs.org/backbone) uses Backbone models describing all the James Bond films. The [code for the Backbone adaptor is here](https://github.com/ractivejs/ractive-adaptors-backbone).


Using adaptors
--------------

Add the adaptor code to your app. Using the Backbone adaptor as an example:

```html
<script src='lib/underscore.js'></script> <!-- Backbone dependency -->
<script src='lib/backbone.js'></script>
<script src='lib/ractive.js'></script>

<!-- the adaptor -->
<script src='lib/adaptors/ractive-adaptors-backbone.js'></script>
```

If you're using module loaders, beware - the adaptor needs access to both `ractive` and `backbone`. You may need to change your paths config (or equivalent), or modify the adaptor source code to fit your app.

Unlike components or other registries where there is a template-level directive that informs Ractive that plugin is to be used, adaptors are a data-level construct and so you use the `adapt` option to tell Ractive which adaptors are to be used with that instance. If you define the adaptors directly on the instance or component, you do not need to specify them in the `adapt` option.

For our example, when you create a new Ractive instance, you can specify which adaptors to use like so:

```js
ractive = new Ractive({
  el: container,
  template: myTemplate,
  data: myBackboneModel,
  adapt: [ 'Backbone' ]
});
```

Ractive will then see if there's a `Backbone` property of `Ractive.adaptors`. (If not, an error will be thrown.) Alternatively, you can pass in the adaptor itself rather than the name, e.g.

```js
ractive = new Ractive({
  el: container,
  template: myTemplate,
  data: myBackboneModel,
  adapt: [ Ractive.adaptors.Backbone ]
});
```

## Creating adaptor plugins

See {{{createLink 'Writing adaptor plugins'}}} to learn how to create your own adaptors.
