---
title: ractive.on()
---
Subscribe to {{{createLink 'events overview' 'events'}}}.

> ### ractive.on( eventName, handler )
> Returns an `Object` with a `cancel` method, which removes the handler.
> > #### **eventName** *`String`*
> > The name of the event to subscribe to
> > #### **handler** *`Function`*
> > The function that will be called, with `ractive` as `this`. The arguments depend on the event. Returning `false` from the handler will stop propagation and prevent default of DOM events and cancel {{{createLink 'event bubbling'}}}.

> ### ractive.on( obj )
> Returns an `Object` with a `cancel` method, which removes all handlers in the passed-in `obj`.
> > #### **obj** *`Object`*
> > An object with keys named for each event to subscribe to. The value at each key is the handler function for that event.

## Examples

```js
// single handler to function
ractive.on( 'activate', function () {...});

// wildcard pattern matching
ractive.on( 'foo.*', function () {...} );

// multiple handlers to one function
ractive.on( 'activate select', function () {...} );

// map of handler/function pairs
ractive.on({
	activate: function () {...},
	select: function () {...}
});

// knock yourself out:
ractive.on({
	activate: function () {...},
	'bip bop boop': function () {...},
	'select foo.* bar': function () {...}
});
```


