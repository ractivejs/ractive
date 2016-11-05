---
title: ractive.observeOnce()
---
Observes the data at a particular {{{createLink 'keypaths' 'keypath'}}} until the first change. After the handler has been called, it will be unsubscribed from any future changes.

Note that you can observe keypath *patterns*...

```js
ractive.observeOnce( 'items.*.status', function ( newValue, oldValue, keypath ) {
	var index = /items.(\d+).status/.exec( keypath )[1];
	alert( 'item ' + index + ' status changed from ' + oldValue + ' to ' + newValue );
});
```

...or multiple space-separated keypaths simultaneously:

```js
ractive.observeOnce( 'foo bar baz', function ( newValue, oldValue, keypath ) {
	alert( keypath + ' changed from ' + oldValue + ' to ' + newValue );
});
```

See {{{createLink 'Observers'}}} for more detail.


> ### ractive.observeOnce( keypath, callback[, options ])
> Returns an object with a `cancel` method, for cancelling the observer

> > #### **keypath** *`String`*
> > The [keypath](keypaths) to observe, or a group of space-separated keypaths. Any of the keys can be a `*` character, which is treated as a wildcard.
> > #### **callback** *`Function`*
> > The function that will be called, with `newValue`, `oldValue` and `keypath` as arguments (see {{{createLink 'Observers'}}} for more nuance regarding these arguments), whenever the observed keypath changes value. By default the function will be called with `ractive` as `this`. Any wildcards in the keypath will have their matches passed to the callback at the end of the arguments list as well.
> > #### options *`Object`*
> > > #### defer *`Boolean`*
> > > Defaults to `false`, in which case observers will fire before any DOM changes take place. If `true`, the observer will fire once the DOM has been updated.
> > > #### context
> > > Defaults to `ractive`. The context the observer is called in (i.e. the value of `this`)