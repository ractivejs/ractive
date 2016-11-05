---
title: Ractive.getNodeInfo()
---
Sometimes it is useful to know which Ractive instance a DOM node is attached to and the details of where it exists in the view. `Ractive.getNodeInfo()` is a static method that exposes this information and helper methods based on Ractive's internal tracking mechanisms.

This is particularly useful for {{{createLink 'decorators'}}} and debugging. Notably, in Chrome, if you inspect an element, that element will be added to the Chrome Developer Tools' node list and can be referenced in the console as `$0`. Try inspecting a Ractive-controlled element and using `Ractive.getNodeInfo($0)` in the console.

> ### Ractive.getNodeInfo( node )
> Returns an object with helper methods to interact with the Ractive instance and context associated with the given node. See [Helpers](#helpers) below.

> > #### **node** *`DOMNode`*
> > The DOM node for which you wish to retrieve the Ractive instance or view details.

> > #### **node** *`String`*
> > A css selector that will be passed to `document.querySelector`. The resulting node will then be used to retrieve the node's Ractive helper.

## Helpers

**All helpers that take a keypath as a parameter will resolve the keypath from the node's context**, meaning that relative references can be used as if they were in the template. Most helper methods correspond directly to an instance method, with the only difference being that the keypath is relative. If the keypath is optional, then the method will use the keypath for its context ( a.k.a. `'.'`). Special references, template aliases, and key and index aliases are also supported.

From this point on, `info` is an object that has context methods and may be an `event` object or the result of a `getNodeInfo` call.

> ### info.add( [keypath][, number] )
> Increments the given keypath by the given number, which defaults to `1`. See {{{createLink 'ractive.add()'}}}.

> ### info.animate( keypath, value[, options] )
> Animates the given keypath to the given value. See {{{createLink 'ractive.animate()'}}}.

> ### info.get( [keypath] )
> Retrieves the value at given keypath, if provided, or the context for this info object. See {{{createLink 'ractive.get()'}}}.
> This can also be used to retrieve the value of index and key aliases, template aliases, and special reference.

> ### info.getBinding()
> If the node represented by this info object has a two-way binding, this will retrieve the value of the binding. For instance, if the node template was `\{{#with foo.bar}}<input id="findMe" value="\{{.baz}}" />\{{/with}}`, then `Ractive.getNodeInfo('#findMe').getBinding()` would return the value of `'foo.bar.baz'`.

> ### info.getBindingPath( [ractive] )
> If the node represented by this info object has a two-way binding, this will return the keypath of the binding. For instance, if the node template was `\{{#with foo.bar}}<input id="findMe" value="\{{.baz}}" />\{{/with}}`, then `Ractive.getNodeInfo('#findMe').getBindingPath()` would return the value of `'foo.bar.baz'`.

> > #### **ractive** *`Ractive instance`*
> > If supplied, the returned keypath will be relative to any mappings defined for the instance.

> ### info.isBound()
> If the node represented by this info object has a two-way binding, this will return true. Otherwise, it will return false.

> ### info.link( source, destination )
> Creates a link to the given souce at the given destination. See {{{createLink 'ractive.link()'}}}.

> ### info.merge( keypath, array )
> Merges the given array into the array at the given keypath. See {{{createLink 'ractive.merge()'}}}.

> ### info.pop( [keypath] )
> Pops a value from the array at the given keypath. See {{{createLink 'ractive.pop()'}}}.

> ### info.push( keypath, ...values )
> Pushes the given values on to the array at the given keypath. See {{{createLink 'ractive.push()'}}}.

> ### info.ractive
> This property holds a reference to the Ractive instance that controls the node represented by this info object.

> ### info.resolve( [keypath][, ractive] )
> Resolves the given keypath to a full keypath. If a `ractive` instance is supplied, the resolved path will also account for any mappings defined for the instance. This is the method used to resolve relative keypaths for all of the other info methods.

> ### info.reverse( keypath )
> Reverses the array at the given keypath. See {{{createLink 'ractive.reverse()'}}}.

> ### info.set( keypath, value )
> Sets the given keypath to the given value. See {{{createLink 'ractive.set()'}}}.

> ### info.setBinding( value )
> If the node represented by this info object has a two-way binding, this sets the binding to the given value.

> ### info.shift( [keypath] )
> Shifts a value from the array at the given keypath. See {{{createLink 'ractive.shift()'}}}.

> ### info.splice( keypath, index, drop, ...add )
> Splices the array at the given keypath. See {{{createLink 'ractive.splice()'}}}.

> ### info.sort( keypath )
> Sorts the array at the given keypath. See {{{createLink 'ractive.sort()'}}}.

> ### info.subtract( [keypath][, number] )
> Decrements the given keypath by the given value, which defaults to `1`. See {{{createLink 'ractive.subtract()'}}}.

> ### info.toggle( [keypath] )
> Toggles the given keypath. See {{{createLink 'ractive.toggle()'}}}.

> ### info.unlink( destination )
> Removes the given link. See {{{createLink 'ractive.unlink()'}}}.

> ### info.unshift( keypath, ...values )
> Unshifts the given values onto the array at the given keypath. See {{{createLink 'ractive.unshift()'}}}.

> ### info.update( [keypath] )
> Triggers an update on the given keypath. See {{{createLink 'ractive.update()'}}}.

> ### info.updateModel( [keypath] )
> Triggers an update on the given keypath from its bindings. See {{{createLink 'ractive.updateModel()'}}}.

