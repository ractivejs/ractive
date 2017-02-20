---
title: new Ractive({...})
section: APIReference
---
## Initialisation

Ractive instances are created using standard javascript instantiation with the `new` keyword:

```js
var ractive = new Ractive();
```

There are no _required_ options, however you'll usually want to specify these base options:

```js
var ractive = new Ractive({
	el: '#container',
	template: '#template',
	data: data
});
```

The full list of initialisation options is {{{createLink 'Options' 'covered here'}}}.

## Initialising `Ractive.extend`

Ractive offers an {{{createLink 'Ractive.extend()' 'extend'}}} method for standard javascript prototypical inheritance:

```js
var MyRactive = Ractive.extend({
	template: '#mytemplate'
});
```
The same {{{createLink 'Options' 'initialisation options'}}} can be supplied to the extend method, plus some additional options.

These are instantiated in exactly the same way as above, supplying any additional options:

```js
var ractive = new MyRactive({
	el: '#container',
	data: data
});
```

See {{{createLink 'Ractive.extend()' }}} for more details.

## Initialisation without `new`

You can also create a new Ractive instance by calling Ractive as a function. It will handle creating a new object and return it from the call.

```js
var ractive = Ractive({
	el: '#container',
	template: '#template',
	data: data
});
```
