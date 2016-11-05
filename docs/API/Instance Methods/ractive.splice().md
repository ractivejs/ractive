---
title: ractive.splice()
---
The Ractive equivalent to ```Array.splice``` that can add new elements to the array while removing existing elements.

> ### ractive.splice( keypath, index, removeCount, add... )
> Returns a `Promise` (see {{{createLink 'Promises'}}}) that will resolve with the removed elements after the update is complete.

> > #### **keypath** *`String`*
> > The {{{createLink 'keypaths' 'keypath'}}} of the array to change, e.g. `list` or `order.items`.

> > #### **index** *`Number`*
> > The index at which to start the operation.

> > #### **removeCount** *`Number`*
> > The number of elements to remove starting with the element at *`index`*. This may be 0 if you don't want to remove any elements.

> > #### **add**
> > Any elements to insert into the array starting at *`index`*. There can be 0 or more elements passed to add to the array.

If the given keypath does not exist (is `undefined`), an empty array will be supplied instead. Otherwise, if the given keypath does not resolve to an array, an error will be thrown.
