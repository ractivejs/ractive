# ractive._super()

Calls the parent method from a child method of the same name.

`ractive._super()` is not always available. Only when Ractive detects its use does it make this reference to the parent method.

**Syntax**

- `ractive._super([arg[, ...argN]])`

**Arguments**

- `[arg] (any)`: One or more arguments to pass to the function.

**Returns**

- `(any)`: Depends on the method called.

**Examples**

```js
const MyComponentSubclass = MyComponent.exten({
  // Overrides the oninit of MyComponent
  oninit: function(...args){
    // Call MyComponent's oninit
    this._super(...args);
  }
});
```

# ractive.add()

Increments the selected keypath.

**Syntax**

- `ractive.add(keypath[, number])`

**Arguments**

- `keypath (string)`: The keypath of the number we're incrementing.
- `[number:number]`: The number to increment by. Defaults to `1`.

**Returns**

- `(Promise)`: A promise that resolves when the operation completes.

**Examples**

```js

```

---

# ractive.animate()

Similar to [`ractive.set()`](), this will update the data and re-render any affected mustaches and notify [observers]().

All animations are handled by a global timer that is shared between Ractive instances (and which only runs if there are one or more animations still in progress), so you can trigger as many separate animations as you like without worrying about timer congestion. Where possible, `requestAnimationFrame` is used rather than `setTimeout`.

Numeric values and strings that can be parsed as numeric values can be interpolated. Objects and arrays containing numeric values (or other objects and arrays which themselves contain numeric values, and so on recursively) are also interpolated.

Note that there is currently no mechanism for detecting cyclical structures! Animating to a value that indirectly references itself will cause an infinite loop.

Future versions of Ractive may include string interpolators - e.g. for SVG paths, colours, transformations and so on, a la D3 - and the ability to pass in your own interpolator.

If an animation is started on a keypath which is *already* being animated, the first animation is cancelled. (Currently, there is no mechanism in place to prevent collisions between e.g. `ractive.animate('foo', { bar: 1 })` and `ractive.animate('foo.bar', 0)`.)

**Syntax**

- `ractive.animate(keypath, value[, options])`
- `ractive.animate(map[, options])`

**Arguments**

- `keypath (string)`: The keypath to animate.
- `value (number|string|Object|Array)`: The value to animate to.
- `map (Object)`: A key-value hash of keypath and value.
- `[options] (Object)`:
    - `[duration] (number)`: How many milliseconds the animation should run for. Defaults to `400`.
    - `[easing] (string|Function)`: The name of an easing function or the easing function itself. Defaults to `linear`.
    - `[step] (Function)`: A function to be called on each step of the animation. Receives `t` and `value` as arguments, where `t` is the animation progress (between `0` and `1`, as determined by the easing function) and `value` is the intermediate value at `t`.
    - `[complete] (Function)`: A function to be called when the animation completes, with the same argument signature as `step` (i.e. `t` is `1`, and `value` is the destination value)

**Returns**

- `(Promise)`: Returns a [Promise]() with an additional `stop` method, which cancels the animation.

**Examples**

```js

```

---

# ractive.detach()

Detaches the instance from the DOM, returning a document fragment. You can reinsert it, possibly in a different place, with [`ractive.insert()`]() (note that if you are reinserting it immediately you don't need to detach it first - it will happen automatically).

**Syntax**

- `ractive.detach()`

**Arguments**

**Returns**

- `(DocumentFragment)`: A document fragment.

**Examples**

```js

```

---

# ractive.find()

Returns the first element inside a given Ractive instance matching a CSS selector. This is similar to doing `this.el.querySelector(selector)` (though it doesn't actually use `querySelector()`).

**Syntax**

- `ractive.find(selector[, options])`

**Arguments**

- `selector (string)`: A CSS selector representing the element to find.
- `[options] (Object)`:

**Returns**

- `(Node)`: A Node.

**Examples**

```js

```

---

# ractive.findAll()

This method is similar to [`ractive.find()`](), with two important differences. Firstly, it returns a list of elements matching the selector, rather than a single node. Secondly, it can return a *live* list, which will stay in sync with the DOM as it continues to update.

**Syntax**

- `ractive.findAll(selector[, options])`

**Arguments**

- `selector (string)`: A CSS selector representing the elements to find.
- `[options] (Object)`
    - `[live] (boolean)`: Whether to return a live list or a static one. Defaults to `false`.

**Returns**

- `(Array<Node>)`: An array of nodes.

**Examples**

```js

```

---

# ractive.findAllComponents()

Returns all components inside a given Ractive instance with the given `name` (or all components of any kind if no name is given).

**Syntax**

- `ractive.findAllComponents([name[, options]])`

**Arguments**

- `[name] (string)`: The name of the component to find.
- `[options] (Object)`
    - `[live] (boolean)`: Whether to return a live list or a static one. Defaults to `false`.

**Returns**

- `(Array<ractive>)`: An array of ractive instances.

**Examples**

```js

```

---

# ractive.findComponent()

Returns the first component inside a given Ractive instance with the given `name` (or the first component of any kind if no name is given).

**Syntax**

- `ractive.findComponent([name[, options]])`

**Arguments**

- `[name] (string)`: The name of the component to find.
- `[options] (Object)`:

**Returns**

- `(Ractive)`: A ractive instance.

**Examples**

```js

```

---

# ractive.findContainer()

Returns the first container of this component instance with the given `name`.

**Syntax**

- `ractive.findContainer(name)`

**Arguments**

- `name (string)`: The name of the container to find.

**Returns**

- `(Ractive)`: Returns the first container of this component with the given `name`.

**Examples**

```js

```

---

# ractive.findParent()

Returns the first parent of this component instance with the given `name`.

**Syntax**

- `ractive.findParent(name)`

**Arguments**

- `name (string)`: The name of the parent to find.

**Returns**

- `(Ractive)`: Returns the first parent of this component with the given `name`.

**Examples**

```js

```

---

# ractive.fire()

Fires an event, which will be received by handlers that were bound using `ractive.on`. In practical terms, you would mostly likely use this with [`Ractive.extend()`](), to allow applications to hook into your subclass.

**Syntax**

- `ractive.fire(eventName[, arg1[, ...argN])`

**Arguments**

- `name (string)`: The name of the event.
- `[arg] (any)`: The arguments that event handlers will be called with.

**Returns**

**Examples**

```js

```

---

# ractive.get()

Returns the value at `keypath`. If the keypath is omitted, returns a shallow copy of all the data in the instance. This data includes mappings introduced by enclosing components, but excludes computed properties.

**Syntax**

- `ractive.get([keypath])`

**Arguments**

- `[keypath] (string)`: The keypath of the data to retrieve.

**Returns**

- `(any)`: Returns whatever data was on the keypath, or all if no keypath was provided.

**Examples**

```js

```

---

# ractive.getNodeInfo()

This is an instance specific version of [`Ractive.getNodeInfo()`]() that will only search the local instance DOM for a matching node when a selector is given. If the given value is not a string, then it is passed directly through to the static version of this method.

**Syntax**

- `ractive.getNodeInfo(node)`

**Arguments**

- `node (string|Node)`: The DOM node or a CSS selector of a target node for which you wish to retrieve the Ractive instance or view details.

**Returns**

- `(NodeInfo)`: Returns an [NodeInfo]() object with helper methods to interact with the Ractive instance and context associated with the given node.

**Examples**

```js

```

---

# ractive.insert()

Inserts the instance to a different location. If the instance is currently in the DOM, it will be detached first. See also [`ractive.detach()`]().

**Syntax**

- `ractive.insert(target[, anchor])`

**Arguments**

- `target (string|Node|array-like)`: The new parent element.
- `[anchor] (string|Node|array-like)`: The sibling element to insert the instance before. If omitted, the instance will be inserted as the last child of the parent.

**Returns**

**Examples**

```js

```

---

# ractive.link()

Creates a link between two [keypaths]() that keeps them in sync. Since Ractive can't always watch the contents of objects, copying an object to two different keypaths in your data usually leads to one or both of them getting out of sync. `link` creates a sort of symlink between the two paths so that Ractive knows they are actually the same object. This is particularly useful for master/detail scenarios where you have a complex list of data and you want to be able to select an item to edit in a detail form.

**Syntax**

- `ractive.link(source, destination)`

**Arguments**

- `source (string)`: The keypath of the source item.
- `destination (string)`: The keypath to use as the destination - or where you'd like the data 'copied'.

**Returns**

- `(Promise)`: Returns a [promise]().

**Examples**

```js
ractive.link( 'some.nested.0.list.25.item', 'current' );
ractive.set( 'current.name', 'Rich' ); // some.nested.0.list.25.item.name is also updated to be 'Rich'
```

This can be used to great effect with method events and the [`@keypath`]() special ref:

```html
{{#each some.nested}}
  {{#each list}}
    {{#with item}}
      {{.name}}
      <button on-click="event.link('.', 'current')">Select</button>
    {{/with}}
  {{/each}}
{{/each}}

Name: <input value="{{~/current.name}}" />
```

Links can be removed using [`ractive.unlink()`]().

---

# ractive.merge()

Sets the indicated keypath to the new array value, but "merges" the existing rendered nodes representing the data into the newly rendered array, inserting and removing nodes from the DOM as necessary. Where necessary, items are moved from their current location in the array (and, therefore, in the DOM) to their new location.

This is an efficient way to (for example) handle data from a server. It also helps to control `intro` and `outro` [transitions]() which might not otherwise happen with a basic [`ractive.set()`]() operation.

To determine whether the first item of `['foo', 'bar', 'baz']` is the same as the last item of `['bar', 'baz', 'foo']`, by default we do a strict equality (`===`) check.

In some situations that won't work, because the arrays contain objects, which may *look* the same but not be identical. To deal with these, we use the `compare` option detailed below.

Merge can also be used to created a context block that uses transitions when the context changes.

**Syntax**

- `ractive.merge(keypath, value[, options])`

**Arguments**

- `keypath (string)`: The [keypath]() of the array we're updating.
- `value (Array)`: The new data to merge in.
- `[options] (Object)`
    - `[compare] (boolean)`: If `true`, values will be stringified (with `JSON.stringify`) before comparison.
    - `[compare] (string)`: A property name that will be used to compare the array elements.
    - `[compare] (Function)`: A function that returns a value with which to compare array members.

**Returns**

- `(Promise)` - Returns a [promise]().

**Examples**


```html
{{#user}}
<div intro='fade'>{{first}} {{last}}</div>
{{/}}
```

```js
var r = new Ractive({
    el: document.body,
    template: '#template',
    data: {
        user: [{
            first: 'sam',
            last: 'smith'
        }]
    },
    complete: function(){
        this.merge('user', [{
            first: 'jane',
            last: 'johnson'
        }])
    }
})

```

---

# ractive.observe()

Observes the data at a particular [keypath](). Unless specified otherwise, the callback will be fired immediately, with `undefined` as `oldValue`. Thereafter it will be called whenever the *observed keypath* changes.

**Syntax**

- `ractive.observe(keypath, callback[, options])`
- `ractive.observe(map[, options])`

**Arguments**

- `keypath (String)`: The [keypath]() to observe, or a group of space-separated keypaths. Any of the keys can be a `*` character, which is treated as a wildcard.
- `callback (Function)`: The function that will be called, with `newValue`, `oldValue` and `keypath` as arguments (see [Observers]() for more nuance regarding these arguments), whenever the observed keypath changes value. By default the function will be called with `ractive` as `this`. Any wildcards in the keypath will have their matches passed to the callback at the end of the arguments list as well.
- `map (Object)`: A map of keypath-observer pairs.
- `[options] (Object)`:
    - `[init] (boolean)`: Defaults to `true`. Whether or not to initialise the observer, i.e. call the function with the current value of `keypath` as the first argument and `undefined` as the second.
    - `[defer] (boolean)`: Defaults to `false`, in which case observers will fire before any DOM changes take place. If `true`, the observer will fire once the DOM has been updated.
    - `[context] (any)`: Defaults to `ractive`. The context the observer is called in (i.e. the value of `this`)

**Returns**

- `(Object)`: An object with a `cancel` method, for cancelling all observers

**Examples**

```js

```

Note that you can observe keypath *patterns*...

```js
ractive.observe( 'items.*.status', function ( newValue, oldValue, keypath ) {
	var index = /items.(\d+).status/.exec( keypath )[1];
	alert( 'item ' + index + ' status changed from ' + oldValue + ' to ' + newValue );
});
```

...or multiple space-separated keypaths simultaneously:

```js
ractive.observe( 'foo bar baz', function ( newValue, oldValue, keypath ) {
	alert( keypath + ' changed from ' + oldValue + ' to ' + newValue );
});
```

See [Observers]() for more detail.

---

# ractive.observeOnce()

Observes the data at a particular [keypath]() until the first change. After the handler has been called, it will be unsubscribed from any future changes.

**Syntax**

- `ractive.observeOnce(keypath, callback[, options])`

**Arguments**

- `keypath (string)`: The [keypath]() to observe, or a group of space-separated keypaths. Any of the keys can be a `*` character, which is treated as a wildcard.
- `callback (Function)`: The function that will be called, with `newValue`, `oldValue` and `keypath` as arguments (see [Observers]() for more nuance regarding these arguments), whenever the observed keypath changes value. By default the function will be called with `ractive` as `this`. Any wildcards in the keypath will have their matches passed to the callback at the end of the arguments list as well.
- `[options] (Object)`:
    - `[defer] (boolean)`: Defaults to `false`, in which case observers will fire before any DOM changes take place. If `true`, the observer will fire once the DOM has been updated.
    - `[context] (any)`: Defaults to `ractive`. The context the observer is called in (i.e. the value of `this`)

**Returns**

- `(Object)`: An object with a `cancel` method, for cancelling the observer.

**Examples**

```js

```

Note that you can observe keypath *patterns*...

```js
ractive.observeOnce( 'items.*.status', function ( newValue, oldValue, keypath ) {
	var index = /items.(\d+).status/.exec( keypath )[1];
	alert( 'item ' + index + ' status changed from ' + oldValue + ' to ' + newValue );
});
```

...or multiple space-separated keypaths simultaneously:

```js
ractive.observeOnce( 'foo bar baz', function ( newValue, oldValue, keypath ) {
	alert( keypath + ' changed from ' + oldValue + ' to ' + newValue );
});
```

See [Observers]() for more detail.

---

# ractive.off()

Removes an event handler, several event handlers, or all event handlers.

To remove a single handler, you must specify both the event name and the handler. If you only specify the event name, all handlers bound to that event name will be removed. If you specify neither event name nor handler, **all** event handlers will be removed.

An alternative way to remove event handlers is to use the `cancel` method of the return value of a call to `ractive.on()`.

**Syntax**

- `ractive.off([eventName[, handler]])`

**Arguments**

- `eventName (string)`: The event name to which this handler is currently bound.
- `handler (Function)`: The handler to remove.

**Returns**

- `(Ractive)`: Returns the `ractive` instance to allow this call to be chainable.

**Examples**

```js

```

---

# ractive.on()

Subscribe to [events]().

**Syntax**

- `ractive.on(eventName, handler)`
- `ractive.on(obj)`

**Arguments**

- `eventName (String)`: The name of the event to subscribe to
- `handler (Function)`: The function that will be called, with `ractive` as `this`. The arguments depend on the event. Returning `false` from the handler will stop propagation and prevent default of DOM events and cancel [event bubbling]().
- `obj (Object)`: An object with keys named for each event to subscribe to. The value at each key is the handler function for that event.

**Returns**

- `(Object)` - An `Object` with a `cancel` method, which removes the handler.
- `(Object)` - An `Object` with a `cancel` method, which removes all handlers in the passed-in `obj`.

**Examples**

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

---

# ractive.once()

Subscribe to an event for a single firing. This is a convenience function on top of [ractive.on()]().

**Syntax**

- `ractive.once(eventName, handler)`

**Arguments**

- `eventName (string)`: The name of the event to subscribe to.
- `handler (Function)`: The function that will be called, with `ractive` as `this`. The arguments depend on the event. Returning `false` from the handler will stop propagation and prevent default of DOM events and cancel [event bubbling]().

**Returns**

- `(Object)`: Returns an `Object` with a `cancel` method, which removes the handler.

**Examples**

```js

```

---

# ractive.pop()

The Ractive equivalent to ```Array.pop``` that removes an element from the end of the array at the given keypath and triggers an update event.

If the given keypath does not exist (is `undefined`), an empty array will be supplied instead. Otherwise, if the given keypath does not resolve to an array, an error will be thrown.

**Syntax**

- `ractive.pop(keypath)`

**Arguments**

- `keypath (string)`: The [keypath]() of the array to change, e.g. `list` or `order.items`.

**Returns**

- `(Promise)`: Returns a [promise]() that will resolve with the removed element after the update is complete.

**Examples**

```js

```

---

# ractive.push()

The Ractive equivalent to ```Array.push``` that appends one or more elements to the array at the given keypath and triggers an update event.

If the given keypath does not exist (is `undefined`), an empty array will be supplied instead. Otherwise, if the given keypath does not resolve to an array, an error will be thrown.

**Syntax**

- `ractive.push(keypath, value[, ...valueN])`

**Arguments**

- `keypath (string)`: The [keypath]() of the array to change, e.g. `list` or `order.items`.
- `value (any)`: The value to append to the end of the array. One or more values may be supplied.

**Returns**

- `(Promise)` - Returns a [Promise]() that will resolve after the update is complete.

**Examples**

```js

```

---

# ractive.render()

Renders the component into a DOM element.

**Syntax**

- `ractive.render(target)`

**Arguments**

- `target (Node|String|array-like)`: The DOM element to render to.

**Returns**

**Examples**

```js

```

---

# ractive.reset()

Resets the entire `ractive.data` object and updates the DOM.

**Syntax**

- `ractive.reset(data)`

**Arguments**

- `data (Object)`: The data to reset with. Defaults to `{}`.

**Returns**

- `(Promise)`: A [promise]().

**Examples**

This differs from `ractive.set()` in the following way:

```js
ractive = new Ractive({
  // ...,
  data: { foo: 1 }
});

ractive.set({ bar: 2 });
console.log( ractive.get() ); // { foo: 1, bar: 2 }

ractive.reset({ bar: 2 });
console.log( ractive.get() ); // { bar: 2 }
```

---

# ractive.resetPartial()

Resets a partial and re-renders all of its use-sites, including in any components that have inherited it. If a component has a partial with a same name that is its own, that partial will not be affected.

Inline partials that don't belong directly to a Ractive instance aren't affected by `resetPartial`.

**Syntax**

- `ractive.resetPartial(name, partial)`

**Arguments**

- `name (string)`: The partial to reset.
- `partial (string|Object|Function)`: A template string, pre-parsed template or a function that returns either.

**Returns**

- `(Promise)`: A [promise]().

**Examples**

```js
ractive = new Ractive({
  // ...,
  partials: { foo: 'foo' }
});

// {{>foo}} will be replaced with 'foo'

ractive.resetPartial('foo', 'bar');

// {{>foo}} will be replaced with 'bar'
```

---

# ractive.reverse()

The Ractive equivalent to ```Array.reverse``` reverses the array at the given keypath and triggers an update event.

If the given keypath does not resolve to an array, an error will be thrown.

**Syntax**

- `ractive.reverse(keypath)`

**Arguments**

- `keypath (String)`: The [keypath]() of the array to reverse, e.g. `list` or `order.items`

**Returns**

- `(Promise)` - A [promise]() that will resolve after the update is complete.

**Examples**

```js

```

---

# ractive.set()

Updates data and triggers a re-render of any mustaches that are affected (directly or indirectly) by the change. Any [observers]() of affected [keypaths]() will be notified.

A `change` [event]() will be fired with `keypath` and `value` as arguments
(or `map`, if you set multiple options at once).

When setting an array value, ractive will reuse the existing DOM nodes for the new array, adding or removing nodes as necessary. This can impact nodes with [transitions](). See [`ractive.merge()`]() for setting a new array value while retaining existing nodes corresponding to individual array item values.

**Syntax**

- `ractive.set(keypath, value)`
- `ractive.set(map)`

**Arguments**

- `keypath (string)`: The [keypath]() of the data we're changing, e.g. `user` or `user.name` or `user.friends[1]` or `users.*.status`.
- `value (any)`: The value we're changing it to. Can be a primitive or an object (or array), in which case dependants of *downstream keypaths* will also be re-rendered (if they have changed).
- `map (Object)`: A map of `keypath: value` pairs, as above.

**Returns**

- `(Promise)`: Returns a [promise]() that will be called after the set operation and any transitions are complete.

**Examples**

```js

```

The `keypath` can also contain wildcards [pattern-observers](). All matching keypaths will be set with the supplied values:

```js
ractive.on('selectAll', function(){
	ractive.set('items.*.selected', true);
})
```

---

# ractive.shift()

The Ractive equivalent to `Array.shift` that removes an element from the beginning of the array at the given keypath and triggers an update event.

If the given keypath does not exist (is `undefined`), an empty array will be supplied instead. Otherwise, if the given keypath does not resolve to an array, an error will be thrown.

**Syntax**

- `ractive.shift(keypath)`

**Arguments**

- `keypath (string)`: The [keypath]() of the array to change, e.g. `list` or `order.items`.

**Returns**

- `(Promise)`: A [promise]() that will resolve with the removed element after the update is complete.

**Examples**

```js

```

---

# ractive.sort()

The Ractive equivalent to ```Array.sort``` sorts the array at the given keypath and triggers an update event.

If the given keypath does not resolve to an array, an error will be thrown.

**Syntax**

- `ractive.sort(keypath)`

**Arguments**

- `keypath (string)`: The [keypath]() of the array to sort, e.g. `list` or `order.items`.

**Returns**

- `(Promise)`: Returns a [promise]() that will resolve after the update is complete.

**Examples**

```js

```

---

# ractive.splice()

The Ractive equivalent to ```Array.splice``` that can add new elements to the array while removing existing elements.

If the given keypath does not exist (is `undefined`), an empty array will be supplied instead. Otherwise, if the given keypath does not resolve to an array, an error will be thrown.

**Syntax**

- `ractive.splice(keypath, index, [removeCount[, add]])`

**Arguments**

- `keypath (string)`: The [keypath]() of the array to change, e.g. `list` or `order.items`.
- `index (number)`: The index at which to start the operation.
- `[removeCount] (number)`: The number of elements to remove starting with the element at *`index`*. This may be 0 if you don't want to remove any elements.
- `[add] (any)`: Any elements to insert into the array starting at *`index`*. There can be 0 or more elements passed to add to the array.

**Returns**

- `(Promise)`: Returns a [promise]() that will resolve with the removed elements after the update is complete.

**Examples**

```js

```

---

# ractive.subtract()

Decrements the selected {{{createLink 'keypaths' 'keypath'}}}.

**Syntax**

- `ractive.subtract(keypath[, number])`

**Arguments**

- `keypath (string)`: The [keypath]() of the number we're decrementing.
- `[number] (number)`: Defaults to `1`. The number to decrement by.

**Returns**

- `(Promise)`: Returns a [promise]().

**Examples**

```js

```

---

# ractive.teardown()

Unrenders this Ractive instance, removing any event handlers that were bound automatically by Ractive.

Calling `ractive.teardown()` causes a `teardown` [event]() to be fired - this is most useful with [`Ractive.extend()`]() as it allows you to clean up anything else (event listeners and other bindings) that are part of the subclass.

**Syntax**

- `ractive.teardown()`

**Arguments**

**Returns**

- `(Promise)`: A [promise]().

**Examples**

```js

```

---

# ractive.toCSS()

Returns the scoped CSS of the current instance and its descendants.

At the moment, this will not work on a direct instance of Ractive and will log a warning. You can only use this method on an instance of a subclass.

**Syntax**

- `ractive.toCSS()`

**Arguments**

**Returns**

- `(string)`: The scoped CSS of the instance.

**Examples**

```js
const Subclass = Ractive.extend({
    ...
    css: 'div{ color: red }'
    ...
});

const subclassInstance = new Subclass({...});

// Contains the scoped version of div{ color: red }
subclassInstance.toCSS();
```

---

# ractive.toHTML()

Returns a chunk of HTML representing the current state of the instance. This is most useful when you're using Ractive in node.js, as it allows you to serve fully-rendered pages (good for SEO and initial pageload performance) to the client.

**Syntax**

- `ractive.toHTML()`

**Arguments**

**Returns**

- `(string)`: The instance HTML.

**Examples**

```js

```

---

# ractive.toggle()

Toggles the selected [keypath](). In other words, if `foo` is [truthy](http://james.padolsey.com/javascript/truthy-falsey/), then `ractive.toggle('foo')` will make it `false`, and vice-versa.

**Syntax**

- `ractive.toggle(keypath)`

**Arguments**

- `keypath (string)`: The [keypath]() to toggle the value of. If **keypath** is a pattern, then all matching keypaths will be toggled.

**Returns**

- `(Promise)`: A [promise]().

**Examples**

```js

```

---

# ractive.transition()

Triggers a transition on a node managed by this Ractive instance.

**Syntax**

- `ractive.transition(transition, node, options)`

**Arguments**

- `transition (string|Function)`: A transition function or a name of a transition function.
- `node (HTMLElement)`: The node on which to start the transition - optional if called from within a Ractive event handler, as it will be retrieved from the event if not supplied.
- `options (Object)`: Options supplied to the transition.

**Returns**

**Examples**

```js

```

---

# ractive.unlink()

Removes a link set up by {{{createLink 'ractive.link()'}}}.

**Syntax**

- `ractive.unlink(destination)`

**Arguments**

- `destination (string)`: The destination supplied to [`ractive.link()`].

**Returns**

- `(Promise)`: A [promise]().

**Examples**

```js

```

---
# ractive.unrender()
---

Unrenders this Ractive instance, throwing away any DOM nodes associated with this instance. This is the counterpart to [`ractive.render()`](). The rest of the ractive instance is left intact, unlike [`ractive.teardown()`]().

**Syntax**

- `ractive.unrender()`

**Arguments**

**Returns**

- `(Promise)`: A [promise]().

**Examples**

```js

```

---
# ractive.unshift()

The Ractive equivalent to ```Array.unshift``` that prepends one or more elements to the array at the given keypath and triggers an update event.

If the given keypath does not exist (is `undefined`), an empty array will be supplied instead. Otherwise, if the given keypath does not resolve to an array, an error will be thrown.

**Syntax**

- `ractive.unshift(keypath, value)`

**Arguments**

- `keypath (string)`: The [keypath]() of the array to change, e.g. `list` or `order.items`.
- `value (any)`: The value to prepend to the beginning of the array. One or more values may be supplied.

**Returns**

- `(Promise)`: Returns a [promise]() that will resolve after the update is complete.

**Examples**

```js

```

---

# ractive.update()

Forces everything that depends on the specified keypaths (whether directly or indirectly) to be 'dirty checked'. This is useful if you manipulate data without using the built in setter methods (i.e. `ractive.set()`, `ractive.animate()`, or array modification):

If no `keypath` is specified, all mustaches and observers will be checked.

**Syntax**

- `ractive.update([keypath])`

**Arguments**

- `[keypath] (string)`: The keypath to treat as 'dirty'. Any mustaches or observers that depend (directly or indirectly) on this keypath will be checked to see if they need to update

**Returns**

- `(Promise)`: A promise. If a keypath is not supplied, this 'dirty checks' everything.

**Examples**

```js
ractive.observe( 'foo', function ( foo ) {
	alert( foo );
});

model.foo = 'changed';
ractive.update( 'foo' ); // causes observer to alert 'changed'
```

---

# ractive.updateModel()

If you programmatically manipulate inputs and other elements that have {{{createLink 'two‐way binding'}}} set up, your model can get out of sync. In these cases, we need to force a resync with `ractive.updateModel()`:

**Syntax**

- `ractive.updateModel([keypath[, cascade]])`

**Arguments**

- `keypath (string)`: The keypath to treat as 'dirty'. Any two-way bindings linked to this keypath will be checked to see if the model is out of date
- `cascade (boolean)`: If true, bindings that are *downstream* of `keypath` will also be checked - e.g. `ractive.updateModel( 'items', true )` would check `items.0.foo` and `items.1.foo` and so on. Defaults to `false`.

**Returns**

- `(Promise)`: A promise. If a `keypath` is not specified, all two-way bindings will be checked.

**Examples**

```js
ractive = new Ractive({
  el: 'container',
  template: '<input value="{{name}}">'
  data: { name: 'Bob' }
});

ractive.find( 'input' ).value = 'Jim';
alert( ractive.get( 'name' ) ); // alerts 'Bob', not 'Jim'

ractive.updateModel();
alert( ractive.get( 'name' ) ); // alerts 'Jim'
```

