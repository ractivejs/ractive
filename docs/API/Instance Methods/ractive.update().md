---
title: ractive.update()
---

Forces everything that depends on the specified {{{createLink 'keypath' 'keypaths'}}} (whether directly or indirectly) to be 'dirty checked'. This is useful if you manipulate data without using the built in setter methods (i.e. {{{createLink 'ractive.set()'}}}, {{{createLink 'ractive.animate()'}}}, or {{{createLink 'array modification' 'array modification'}}}):

```js
ractive.observe( 'foo', function ( foo ) {
	alert( foo );
});

model.foo = 'changed';
ractive.update( 'foo' ); // causes observer to alert 'changed'
```

If no `keypath` is specified, all mustaches and observers will be checked.


> ### ractive.update( keypath )
> Returns a `Promise` (see {{{createLink 'Promises'}}})

> > #### **keypath** *`String`*
> > The keypath to treat as 'dirty'. Any mustaches or observers that depend (directly or indirectly) on this keypath will be checked to see if they need to update


> ### ractive.update()
> Returns a `Promise` (see {{{createLink 'Promises'}}}). This 'dirty checks' everything.
