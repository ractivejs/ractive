---
title: 'Proxy events'
---

*See also: {{{createLink 'method calls' 'method calls from templates'}}}*

Ractive has a concept of *proxy events*, which translate a user *action* (e.g. a mouseclick) defined via an {{{createLink 'event directives' 'event directive'}}} into an *intention* (e.g. 'select this option'). This allows you to handle user interaction in a readable, declarative fashion, without resorting to peppering your markup with class names to use as 'hooks' (which must then be kept consistent between your markup and your JavaScript code).

As with all events in Ractive, you subscribe with {{{createLink 'ractive.on()'}}} (also see {{{createLink 'publish-subscribe'}}}). Proxy events declare the handler name of the event that will be fired, along with any optional arguments:

```js
ractive = new Ractive({
  el: 'body',
  template: '<button on-click="activate">click me!</button>'
});

ractive.on( 'activate', function ( event ) {
  alert( 'Activating!' );
});
```

In this example, it is `activate` (and not `click`!) that is the name of the handler event that will be fired for any registered handlers created via {{{createLink 'ractive.on()'}}}.

## Event arguments

### The `event` object

The first argument to a proxy event handler is always a Ractive `event` object. It contains various properties:

* `event.name` - the name of the event, in this case 'activate'
* `event.node` - the DOM node in question
* `event.keypath` - the {{{createLink 'Keypaths' 'keypath'}}} of the current context
* `event.context` - the value of `this.get(event.keypath)`
* `event.index` - a map of index references
* `event.component` - the component that raised the event, only present on {{{createLink 'event bubbling' 'bubbled events'}}}
* `event.original` - the original DOM event, if available

In the example above, `event.keypath` might be `items.0` for the first item in the list, `items.1` for the second, and so on. The `event.index` map would have a property `i`, which would correspond to those indices.

The event object is also available in event handlers using `this.event`, see {{{createLink 'publish-subscribe' 'publish-subscribe' 'accessing-the-event-object'}}} for more details.

### Custom arguments

__NOTE:__ Arguments to proxy events have been deprecated because they are too easy to break. If you need to pass arguments with your event, you can use `@this.fire('myEvent', event, arg1, arg2, etc)`.

We might want to pass arguments to our handler in addition to the `event` object. We can do that by listing them, comma-separated, after the event name:

```html
<h1>Let's shop!</h1>
<ul>
  \{{#each items: i}}
    <li>
      <p>\{{i+1}}: \{{description}}</p>
      <label><input value='\{{qty}}'> Quantity</label>

      <!-- when the user clicks this button, add {\{qty}} of this item -->
      <button on-click='addToCart:\{{this}},\{{qty}}'>Add to cart</button>
    </li>
  \{{/each}}
</ul>
```

```js
ractive.on( 'addToCart', function ( event, item, qty ) {
  /* code goes here */
});
```

### Cancelling DOM events

If you return `false` from a proxy event handler, ractive will automatically call both `preventDefault()` and `stopPropagation()` on the original DOM event.

Note that returning `false` has a dual purpose of both cancelling further bubbling up the view hierarchy {{{createLink 'Event bubbling' 'event bubbling'}}} __as well as__ cancelling the DOM Event if the event was DOM-based.

If you only want to cancel the DOM event, you can call the appropriate methods directly on `event.original` or `this.event.original`, which are both references to the current DOM event object.


## Reserved event names

Note: the built-in {{{createLink 'lifecycle events'}}} are **reserved**, which means you can't use their names as proxy events.


## Dynamic proxy event names

{{{createLink 'Mustaches' 'Mustache references'}}} can be used as proxy event names:

```html
<button on-click="\{{handler}}">click me!</button>
```

In practive this is of limited value, but a more important side effect is that if no handler is specified (a falsey value) the DOM event is not subscribed and will unsubscribe or resubscribe as the handler value changes. Combined with a conditional section, this allows a proxy event to be conditionally subscribed _at the DOM level_:

```html
<button on-click="\{{#active}}select\{{/}}">click me!</button>
```
In this example, the DOM `click` event is subscribed and unsubscribed as the value of `active` is truthy or falsey.
