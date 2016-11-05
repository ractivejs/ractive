---
title: ractive.fire()
---
Fires an event, which will be received by handlers that were bound using `ractive.on`. In practical terms, you would mostly likely use this with {{{createLink 'Ractive.extend()'}}}, to allow applications to hook into your subclass.


> ### ractive.fire( eventName[, arg1[, arg2[, ...argN]]])
> > #### **eventName** *`String`*
> > The name of the event
> > #### arg1 ... argN
> > The arguments that event handlers will be called with
