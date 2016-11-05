---
title: ractive.off()
---
Removes an event handler, several event handlers, or all event handlers.

To remove a single handler, you must specify both the event name and the handler. If you only specify the event name, all handlers bound to that event name will be removed. If you specify neither event name nor handler, **all** event handlers will be removed.

An alternative way to remove event handlers is to use the `cancel` method of the return value of a call to `ractive.on()`.


> ### ractive.off([ eventName[, handler ]])
> Returns the `ractive` instance to allow this call to be chainable.
> > #### eventName *`String`*
> > The event name to which this handler is currently bound
> > #### handler *`Function`*
> > The handler to remove
