---
title: Writing adaptor plugins
---

An {{{createLink 'Adaptors' 'adaptor'}}} is an object with two methods - `filter` and `wrap`:

```js
myAdaptor = {
  filter: function ( object, keypath, ractive ) {
    // return `true` if a particular object is of the type we want to adapt
  },
  wrap: function ( ractive, object, keypath, prefixer ) {
    // set up event bindings etc, and return a 'wrapper'
  }
};
```

The 'wrapper' allows Ractive to interact with the object. The easiest way to explain it is with an example.

Bear with me, there's quite a lot of code here
----------------------------------------------

Suppose you have a `Box` class, which looks like this:

```js
Box = function ( width, height ) {
  this.width = width;
  this.height = height;
};

Box.prototype = {
  getArea: function () {
    return this.width * this.height;
  },
  setWidth: function ( width ) {
    this.width = width;
  },
  setHeight: function ( height ) {
    this.height = height;
  }
};
```

Now suppose we'd like to have a setup like this:

```html
<table>
  <thead>
    <tr><th>Width</th><th>Height</th><th>Area</th></tr>
  </thead>

  <tbody>
    {{#boxes}}
      <tr><td>{{width}}</td><td>{{height}}</td><td>{{area}}</td></tr>
    {{/boxes}}
  </tbody>
</table>
```

```js
var littleBox, mediumBox, bigBox, ractive;

littleBox = new Box( 5, 7 );
mediumBox = new Box( 12, 20 );
bigBox = new Box( 35, 45 );

ractive = new Ractive({
  el: 'container',
  template: myTemplate,
  data: { boxes: [ littleBox, mediumBox, bigBox ] }
});
```

What we want is to be able to interact with the boxes themselves, and have our table update itself:

```js
// This should update both the width and area cells of the first table row
littleBox.setWidth( 7 );
```

We can do that with a box adaptor:

```js
boxAdaptor = {
  // Ractive uses the `filter` function to determine whether something
  // needs to be wrapped or not. For example 'boxes' doesn't need to be
  // wrapped because it's an array, but 'boxes.0' - which is the same as
  // our `littleBox` variable - does.
  filter: function ( object ) {
    return object instanceof Box;
  },

  // If an object passes the filter, we wrap it.
  wrap: function ( ractive, box, keypath, prefixer ) {
    // We can simply overwrite the prototype methods with ones that
    // do the same thing, but also notify Ractive about the changes
    box.setWidth = function ( width ) {

      this.width = width;

      // Very often, inside adaptors, we need to turn _relative keypaths_
      // into _absolute keypaths_. For example if this box's keypath is
      // 'boxes.0', we need to turn 'width' and 'area' into 'boxes.0.width'
      // and 'boxes.0.area'.
      //
      // This is such a common requirement that a helper function -
      // `prefixer` - is automatically generated for each wrapper.
      ractive.set( prefixer({
        width: width,
        area: box.getArea()
      }));
    };

    box.setHeight = function ( height ) {
      this.height = height;

      ractive.set( prefixer({
        height: height,
        area: box.getArea()
      }));
    };

    // The wrapper we return is used by Ractive to interact with each box.
    // It must have a `teardown` method and a `get` method.
    //
    // If you want to be able to interact with the object via Ractive (e.g.
    // `ractive.set( 'boxes[0].width', 10 )` as well as the other way round,
    // then you should also provide `set` and `reset` methods.
    return {
      // When a given Box instance is no longer relevant to Ractive, we
      // revert it to its normal state
      teardown: function () {
        // we just remove the setWidth and setHeight methods,
        // so that the prototype methods get used instead
        delete box.setWidth;
        delete box.setHeight;
      },

      // The `get()` method returns an object representing how Ractive should
      // 'see' each Box instance
      get: function () {
        return {
          width: box.width,
          height: box.height,
          area: box.getArea()
        };
      },

      // The `set()` method is called when you do `ractive.set()`, if the keypath
      // is _downstream_ of the wrapped object. So if, for example, you do
      // `ractive.set( 'boxes[0].width', 10 )`, this `set()` method will be called
      // with 'width' and 10 as arguments.
      set: function ( property, value ) {
        if ( property === 'width' || property === 'height' ) {
          box[ property ] = value;
          ractive.set( keypath + '.area', box.getArea() );
        }
      },

      // The `reset()` method is called when you do `ractive.set()`, if the keypath
      // is _identical_ to the keypath of the wrapped object. Two things could happen
      // - the wrapped object could modify itself to reflect the new data, or (if it
      // doesn't know what to do with the new data) it could return `false`, in which
      // case it will be torn down.
      reset: function ( data ) {
        // if `data` is a new Box instance, or if it isn't an object at all,
        // we should get rid of this one
        if ( typeof data !== 'object' || data instanceof Box ) {
          return false;
        }

        if ( data.width !== undefined ) {
          box.width = width;
        }

        if ( data.height !== undefined ) {
          box.height = width;
        }
      }
    };
  }
};
```

You can see this adaptor in action [in a JSFiddle here](http://jsfiddle.net/rich_harris/ATAgH/). Notice that because our wrapper includes a `set` method, {{{createLink 'two-way binding'}}} works seamlessly.


Adding polish
-------------

This adaptor works, but we can improve it. Rather than re-creating the `teardown`, `get`, `set`, and `reset` methods each time we wrap a box, we can use prototypal inheritance instead. Study the existing adaptors to see this in action.

Something else to be aware of: there is no built-in mechanism for avoiding infinite loops. If your wrapper calls `ractive.set()`, and that causes the wrapper's `set()` method to be called, which causes the underlying object to change, triggering an event which causes `ractive.set()` to be called, then a 'Maximum call stack size exceeded' message isn't far away.

This isn't a problem with primitive values (numbers, strings, booleans and so on) because Ractive doesn't bother calling `set()` if a value hasn't changed. But with objects and arrays, there's no easy and performant way to tell if the contents have changed, so `set()` gets called *in case something changed* rather than *because something changed*. You can solve this problem with a short-circuiting mechanism - again, study the examples.


Share your adaptors!
--------------------

If you create an adaptor that you think other developers would be able to use, please share it via [@RactiveJS](http://twitter.com/RactiveJS)!
