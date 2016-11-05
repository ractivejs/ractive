---
title: ractive.unshift()
---
The Ractive equivalent to ```Array.unshift``` that prepends one or more elements to the array at the given keypath and triggers an update event.

> ### ractive.unshift( keypath, value )
> Returns a `Promise` (see {{{createLink 'Promises'}}}) that will resolve after the update is complete.

> > #### **keypath** *`String`*
> > The {{{createLink 'keypaths' 'keypath'}}} of the array to change, e.g. `list` or `order.items`.

> > #### **value**
> > The value to prepend to the beginning of the array. One or more values may be supplied.

If the given keypath does not exist (is `undefined`), an empty array will be supplied instead. Otherwise, if the given keypath does not resolve to an array, an error will be thrown.
