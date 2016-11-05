---
title: Writing event plugins
---
If you're using {{{createLink 'events' 'proxy events' 'on-events'}}}, you can either use the standard DOM events that an element can listen to (e.g. `click`, `mouseover`, `touchmove`, `load`, whatever) or you can use custom event definitions.

These allow you to define more complex events than the native ones, but still treat them as first class citizens. For example the `tap` event abstracts away differences between mouse and touch interfaces, eliminating the 300ms delay users would experience on a touch device if you were only listening for `click` events:

```html
<a class='button' on-tap='select'>Tap me!</a>
```

You could also use the event definition API to normalise browser behaviour (e.g. with `mouseenter` and `mouseleave`, which are handy and widely-used events, but non-standard ones), or to implement swiping and other gestures.

Future versions of Ractive may include more event definitions 'out of the box' - for now, there is just the `tap` event.


## The event definition API

When Ractive sees a `on-[eventName]` directive, it first looks in `Ractive.events` for an `[eventName]` property, and if it finds one it *applies the definition*. (If not, it assumes that `[eventName]` refers to a native DOM event.)

Event definitions receive two arguments - `node`, and `fire`. `node` is the element to which the definition is being applied, and `fire` is the function that must be called when the event has taken place.

### `fire` when ready

The `fire` function takes a single argument which is the `event` object received by handlers. It will be augmented with `context`, `keypath` and `index` properties (TODO: explain these).

To be consistent with 'native' proxy events, the `event` object must have a `node` property (that's right, you pass the reference back - this allows us to reuse handlers with many different elements, without penalty), and if applicable an `original` property which should be an underlying DOM event.

You can add as many other properties as you like, however (swipe start position, long press duration, whether the user is currently standing on their head, whatever you like).

### The event definition return value

Event definitions should return an object with a `teardown` property, which is a function that removes any DOM event handlers that were bound as part of the setup (and undoes any other changes that were applied).

### An example

All this will make more sense with an example. Let's define a `menu` event, which will allow us to insert our own custom menu.

If the user is using a mouse, we want to intercept the `contextmenu` event (which is generally fired on right-click). On touch devices, we'll use a long press to signal that the user wants to open the menu, as that is a common interaction within apps.

```js
Ractive.events.menu = function ( node, fire ) {
  var longpressDuration = 500, threshold = 5, contextmenuHandler, touchstartHandler;

  // intercept contextmenu events and suppress them
  contextmenuHandler = function ( event ) {
    event.preventDefault();

    // we'll pass along some coordinates. This will make more sense below
    fire({
      node: node,
      original: event,
      x: event.clientX,
      y: event.clientY
    });
  };

  node.addEventListener( 'contextmenu', contextmenuHandler );

  // that was easy! but touch is a little more complicated
  touchstartHandler = function ( event ) {
    var touches, touch, finger, startX, startY, moveHandler, cancel, timeout;

    // for simplicity, we'll only deal with single finger presses
    if ( event.touches.length !== 1 ) {
      return;
    }

    // suppress the default behaviour
    event.preventDefault();

    // we'll need this info later
    touch = event.touches[0];
    finger = touch.identifier;
    startX = touch.clientX;
    startY = touch.clientY;

    // after the specified delay, fire the event...
    timeout = setTimeout( function () {
      // there is no underlying event we could meaningfully pass on. but
      // we can pass along some coordinates
      fire({
        node: node,
        x: startX,
        y: startY
      });
      cancel();
    }, longpressDuration );

    // ...unless the timeout is cancelled
    cancel = function () {
      clearTimeout( timeout );

      // tidy up after ourselves
      window.removeEventListener( 'touchmove', touchmoveHandler );
      window.removeEventListener( 'touchend', cancel );
      window.removeEventListener( 'touchcancel', cancel );
    };

    // if the user moves their finger, test whether they've moved it beyond a
    // certain threshold or if they've left the target element
    touchmoveHandler = function ( event ) {
      var touch, currentTarget;

      // find the right touch (another finger may have touched the screen)
      i = event.touches.length;
      while ( i-- ) {
        if ( event.touches[i].identifier === finger ) {
          touch = event.touches[i];
          break;
        }
      }

      if ( !touch ) {
        cancel();
        return;
      }

      dx = touch.clientX - startX;
      dy = touch.clientY - startY;
      currentTarget = document.elementFromPoint( touch.clientX, touch.clientY );

      // if the finger has moved too far, or is no longer over the target, cancel
      if ( Math.abs( dx ) > threshold || Math.abs( dy ) > threshold || !el.contains( currentTarget ) ) {
        cancel();
      }
    };

    window.addEventListener( 'touchmove', touchmoveHandler );
    window.addEventListener( 'touchend', cancel );
    window.addEventListener( 'touchcancel', cancel );
  };

  node.addEventListener( 'touchstart', touchstartHandler );

  // return an object with a teardown method, so we can unbind everything when the
  // element is removed from the DOM
  return {
    teardown: function () {
      node.removeEventListener( 'contexmenu', contextmenuHandler );
      node.removeEventListener( 'touchstart', touchstartHandler );
    }
  };
};
```

You can now use the `menu` event in Ractive instances:

```html
<div on-menu='showMenu'>This element has its own context menu</div>
```

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate
});

ractive.on( 'showMenu', function ( event ) {
  // show menu at client coordinates event.x, event.y
});
```
