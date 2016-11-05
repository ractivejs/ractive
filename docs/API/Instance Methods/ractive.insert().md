---
title: ractive.insert()
---

Inserts the instance to a different location. If the instance is currently in the DOM, it will be detached first. See also {{{createLink 'ractive.detach()'}}}.

> ### ractive.insert( target[, anchor ])

> > #### **target** *`Node`* or *`String`* or *`jQuery`* (see {{{createLink 'Valid selectors'}}})
> > The new parent element

> > #### anchor *`Node`* or *`String`* or *`jQuery`*
> > The sibling element to insert the instance before. If omitted, the instance will be inserted as the last child of the parent.
