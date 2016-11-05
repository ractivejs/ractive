---
title: ractive.toggle()
---
Toggles the selected {{{createLink 'keypaths' 'keypath'}}}. In other words, if `foo` is [truthy](http://james.padolsey.com/javascript/truthy-falsey/), then `ractive.toggle('foo')` will make it `false`, and vice-versa.


> ### ractive.toggle( keypath )
> Returns a `Promise` (see {{{createLink 'Promises'}}})

> > #### **keypath** *`String`*
> > The {{{createLink 'keypaths' 'keypath'}}} to toggle the value of. If **keypath** is a pattern, then all matching keypaths will be toggled.
