Events allow custom-named events on DOM elements. Common use cases for custom DOM events include normalizing cross-browser events, normalizing cross-device events, implementing custom events like gestures, and so much more.

# Writing events

```js
// Basic structure of an event

function MyEvent(node, fire){
  // Setup code
  return {
    teardown: function(){
      // Cleanup code
    }
  };
}
```

Events are simply functions that are called to set up the event on a DOM element. The event function accepts two arguments: `node` and `fire`, and returns an object containing a `teardown` property.

`node` is the element to which the event is being applied.

`fire` is the function that must be called when the event has taken place. `fire` takes a single argument, the event object received by handlers. The minimum requirement for the event object is a `node` property that references DOM node the event is attached to, and an `original` property which references the native DOM `event` object supplied by the native handler, if available.

The event object will be augmented with `context`, `keypath` and `index` properties, whose values depend on the data context the node is in. `context` references the data context that surrounds the node, `keypath` is a string that leads to the current data context and `index` is a number that references the index number of the data, should the data context be in an array.

`teardown` is a function that gets called once the element is torn down. This allows the event to clean up after itself.

# Registering events

Like other plugins, there's 3 ways you can register events:

Globally via the `Ractive.events` static property.

```js
Ractive.events.myevent = MyEvent;
```

Per component via the component's `events` initialization property.

```js
const MyComponent = Ractive.extend({
  events: {
    myevent: MyEvent
  }
});
```

Or via the instance's `events` initialization property.

```js
const ractive = new Ractive({
  events: {
    myevent: MyEvent
  }
});
```

# Using events

Events use the same `on-*` attribute syntax as component and DOM events. When Ractive encounters an `on-*` attribute on a DOM element, it looks for a registered event and applies it on the elemnt. If no matching event name was found, Ractive will think the event name is a native DOM event and will attach one accordingly.

```html
// This will apply the "mycustomevent" custom event.
<span on-myevent="foo()">Click me!</span>

// No "click" custom event registered. This will attach a regular click event.
<span on-click="foo()">Click me too!</span>
```

# Examples

Here's an example of a "long press" event which fires when the mouse is clicked and held for 200ms.

```js
// Definition
Ractive.events.longpress = function(node, fire){
  let timer = null;

  function clearTimer(){
    if(timer) clearTimeout(timer);
    timer = null;
  }

  function mouseDownHandler(event){
    clearTimer();

    timer = setTimeout(function(){
      fire({
        node: node,
        original: event
      });
    }, 200);
  }

  function mouseUpHandler(){
    clearTimer();
  }

  node.addEventListener('mousedown', mouseDownHandler);
  node.addEventListener('mouseup', mouseUpHandler);

  return {
    teardown: function(){
      node.removeEventListener('mousedown', mouseDownHandler);
      node.removeEventListener('mouseup', mouseUpHandler);
    }
  };
};

// Usage:
new Ractive({
  el: 'body',
  template: `
    <span on-longpress="greetz()">Click Me!</span>
  `,
  greetz: function(){
    console.log('Hello World!');
  }
});
```
