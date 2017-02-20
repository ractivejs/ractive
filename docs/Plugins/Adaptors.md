Adaptors are a way of teaching Ractive to communicate seamlessly with other libraries such as Backbone. This means that you can, for example, have some or all of your app's data handled by Backbone - including fetching from and saving to your server, validation, sorting, filtering and so on - but still build a reactive user interface using Ractive, without having to create custom View classes or adding a whole load of event binding code.

It's probably easier to show, rather than tell: [this example application](http://examples.ractivejs.org/backbone) uses Backbone models describing all the James Bond films. The [code for the Backbone adaptor is here](https://github.com/ractivejs/ractive-adaptors-backbone).

# Using adaptors
--------------

Add the adaptor code to your app. Using the Backbone adaptor as an example:

```html
<script src='lib/underscore.js'></script> <!-- Backbone dependency -->
<script src='lib/backbone.js'></script>
<script src='lib/ractive.js'></script>

<!-- the adaptor -->
<script src='lib/adaptors/ractive-adaptors-backbone.js'></script>
```

If you're using module loaders, beware - the adaptor needs access to both `ractive` and `backbone`. You may need to change your paths config (or equivalent), or modify the adaptor source code to fit your app.

Unlike components or other registries where there is a template-level directive that informs Ractive that plugin is to be used, adaptors are a data-level construct and so you use the `adapt` option to tell Ractive which adaptors are to be used with that instance. If you define the adaptors directly on the instance or component, you do not need to specify them in the `adapt` option.

For our example, when you create a new Ractive instance, you can specify which adaptors to use like so:

```js
ractive = new Ractive({
  el: container,
  template: myTemplate,
  data: myBackboneModel,
  adapt: [ 'Backbone' ]
});
```

Ractive will then see if there's a `Backbone` property of `Ractive.adaptors`. (If not, an error will be thrown.) Alternatively, you can pass in the adaptor itself rather than the name, e.g.

```js
ractive = new Ractive({
  el: container,
  template: myTemplate,
  data: myBackboneModel,
  adapt: [ Ractive.adaptors.Backbone ]
});
```

# Writing adaptor plugins


An adaptor is an object with two methods - `filter` and `wrap`:

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

You can see this adaptor in action [in a JSFiddle here](http://jsfiddle.net/rich_harris/ATAgH/). Notice that because our wrapper includes a `set` method, [two-way binding]() works seamlessly.

# Adding polish

This adaptor works, but we can improve it. Rather than re-creating the `teardown`, `get`, `set`, and `reset` methods each time we wrap a box, we can use prototypal inheritance instead. Study the existing adaptors to see this in action.

Something else to be aware of: there is no built-in mechanism for avoiding infinite loops. If your wrapper calls `ractive.set()`, and that causes the wrapper's `set()` method to be called, which causes the underlying object to change, triggering an event which causes `ractive.set()` to be called, then a 'Maximum call stack size exceeded' message isn't far away.

This isn't a problem with primitive values (numbers, strings, booleans and so on) because Ractive doesn't bother calling `set()` if a value hasn't changed. But with objects and arrays, there's no easy and performant way to tell if the contents have changed, so `set()` gets called *in case something changed* rather than *because something changed*. You can solve this problem with a short-circuiting mechanism - again, study the examples.
