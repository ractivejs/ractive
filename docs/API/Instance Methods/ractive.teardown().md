---
title: ractive.teardown()
---

Unrenders this Ractive instance, removing any event handlers that were bound automatically by Ractive.

Calling `ractive.teardown()` causes a `teardown` {{{createLink 'events' 'event'}}} to be fired - this is most useful with {{{createLink 'Ractive.extend()'}}} as it allows you to clean up anything else (event listeners and other bindings) that are part of the subclass.


> ### ractive.teardown()
> Returns a `Promise` (see {{{createLink 'Promises'}}})
