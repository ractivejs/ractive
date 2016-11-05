---
title: ractive.once()
---
Subscribe to an event for a single firing. This is a convenience function on top of {{{createLink 'ractive.on()'}}}.

> ### ractive.once( eventName, handler )
> Returns an `Object` with a `cancel` method, which removes the handler.
> > #### **eventName** *`String`*
> > The name of the event to subscribe to
> > #### **handler** *`Function`*
> > The function that will be called, with `ractive` as `this`. The arguments depend on the event. Returning `false` from the handler will stop propagation and prevent default of DOM events and cancel {{{createLink 'event bubbling'}}}.
