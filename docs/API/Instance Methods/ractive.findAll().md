---
title: ractive.findAll()
---
This method is similar to {{{createLink 'ractive.find()'}}}, with two important differences. Firstly, it returns a list of elements matching the selector, rather than a single node. Secondly, it can return a *live* list, which will stay in sync with the DOM as it continues to update.


> ### ractive.findAll( selector[, options ] )
> Returns an `Array`
> > #### **selector** *`String`*
> > A CSS selector representing the elements we want to be in our collection
> > #### options *`Object`*
> > > #### live *`Boolean`*
> > > Defaults to `false`. Whether to return a live list or a static one.