---
title: Ractive.defaults
section: APIReference
---

Most of the {{{createLink 'options' 'initialisation options'}}} can be assigned
to the `Ractive.defaults` property and will be used as a default option on any future created instances.
If the same option is supplied during initialisation, it will override the default:

```js
Ractive.defaults.delimiters = [ '[[', ']]' ];

// uses the delimiters specified above
ractive1 = new Ractive({
	template: 'hello [[world]]'
});

// uses the delimiters specified in the init options
rative2 = new Ractive({
	template: 'hello //world\\',
	delimiters: [ '//', '\\' ]
});
```

The exception is for {{{createLink 'Plugins' 'plugin registries'}}} which, for the sake of convenience, are
'registered' directly on `Ractive`. Also, when provided as initialisation or extend options, they do
not replace, but rather combine with the default registry options:

```js
Ractive.components.myComponent = MyComponent;

ractive1 = new Ractive({});
// ractive1.components has MyComponent

ractive2 = new Ractive({
	components: {
		otherComponent: OtherComponent
	}
});
// ractive2.components has MyComponent _and_ OtherComponent
```

The `data` and `computed` options, while set on `Ractive.defaults`, also combine values rather
than replace. <!--See {{{ createLink '' 'registries' }}} for more detials.-->

### Defaults and Registries on Extended Ractive

Defaults can also be specified on any Component or View created via {{{createLink 'Ractive.extend()'}}}:

```js
var MyRactive = Ractive.extend();

MyRactive.defaults.el = document.body;

```

Likewise, registry options are available on the constructor:

```js
var MyRactive = Ractive.extend({
	template: '<p>\{{>foo}}</p>p>'
});

MyRactive.partials.foo = '{{foo}} is great';
```

