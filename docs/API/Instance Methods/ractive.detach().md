---
title: ractive.detach()
---

Detaches the instance from the DOM, returning a document fragment. You can reinsert it, possibly in a different place, with {{{createLink 'ractive.insert()'}}} (note that if you are reinserting it immediately you don't need to detach it first - it will happen automatically).

> ### ractive.detach()
> Returns a `DocumentFragment`
