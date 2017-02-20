---
title: Computed Properties
---
The idea is fairly simple: you can define computed properties that update reactively based on their dependencies. In previous versions you may have done something as follows.
```js
ractive = new Ractive({
  el: 'body',
  template: '\{{width}} * \{{height}} = \{{ area() }}', // note the function invocation
  data: {
    width: 100,
    height: 100,
    area: function () { return this.get( 'width' ) * this.get( 'height' ); }
  }
});
```

That's nice and all - the `\{{ area() }}` mustache updates reactively as `width` and `height` change - but it's limited. To get the area value programmatically you'd have to do something like...

```js
area = ractive.get('area').call(ractive);
```

...which effectively prevents you from composing computed values together in any meaningful way. And you can't 'observe' the area outside of the template, without doing something like this:

```js
ractive.observe( 'width height', function () {
	var area = this.get( 'width' ) * this.get( 'height' );
	doSomething( area );
});
```


## Computed properties to the rescue

Now, you can do

```js
ractive = new Ractive({
  el: 'body',
  template: '\{{width}} * \{{height}} = \{{area}}', // `area` looks like a regular property
  data: {
    width: 100,
    height: 100
  },
  computed: {
    area: function () { return this.get( 'width' ) * this.get( 'height' ); }
  }
});
```

With this, the `area` property can be treated like any other. It will update reactively (because the calls to `ractive.get()` tell Ractive that it should be recomputed when `width` or `height` change), so you can do...

```js
ractive.observe( 'area', doSomething );
```

...instead of manually recalculating it. And computed values can depend on other computed values, and so on (before anyone asks, we're not doing a topological sort or anything fancy like that - in real world scenarios I'd expect the overhead of doing the sort to be greater than the cost of occasionally recomputing a node in the dependency graph more times than is required).


## Compact syntax

The syntax used above, where each computed property is defined as a function, gives you a lot of flexibility. But there's a more compact string syntax you can use:

```js
ractive = new Ractive({
  ...,
  computed: {
    area: '${width} * ${height}'
  }
});
```

This string is turned into a function with the `Function` constructor (which unfortunately means it isn't [CSP compliant](https://developer.mozilla.org/en-US/docs/Security/CSP)) - any `${...}` blocks are basically turned into `ractive.get('...')`, so it works exactly the same way. Needless to say you can use any JavaScript here - `${foo}.toUpperCase()`, `Math.round(${num})`, and so on.


## Setting computed values

By default, computed values are read-only, and if you try to `ractive.set('someComputedProperty')` an error will be thrown. But you can use a third syntax option which allows you to declare a `set()` method:

```js
ractive = new Ractive({
  data: { firstname: 'Douglas', lastname: 'Crockford' },
  computed: {
    fullname: {
      get: '${firstname} + " " + ${lastname}', // or use the function syntax
      set: function ( fullname ) {
        var names = fullname.split( ' ' );

        this.set({
          firstname: names[0] || '',
          lastname: names[1] || ''
        });
      }
    }
  }
});

ractive.set( 'fullname', 'Rich Harris' );

ractive.get( 'firstname' ); // Rich
ractive.get( 'lastname' ); // Harris
```

## Components

You can, of course, declare computed values on components:

```js
Box = Ractive.extend({
  template: boxTemplate,
  computed: { area: '${width} * ${height}' }
});

box = new Box({
  ...,
  data: { width: 20, height: 40 }
});

box.get( 'area' ); // 800
```

Additional computed properties can be declared on the instance:

```js
box2 = new Box({
  ...,
  data: { width: 20, height: 40, depth: 60 },
  computed: { volume: '${area} * ${depth}' }
});

box2.get( 'area' ); // 800
box2.get( 'volume' ); // 48000
```

## Data context for computed properties

Computed properties can only be calculated for the instance context as a whole. You can't, for example, directly
compute a value for each member of an array:

```js
new Ractive({
  template: '\{{#boxes}}\{{area}}\{{/}}',
  data: {
    boxes: [
      { width: 20, height: 40 },
      { width: 30, height: 45 },
      { width: 20, height: 20 }
    ]
  },
  // there's no way to specify this for "each" box :(
  computed: { area: '${width} * ${height}' }
});
```

The solution is to either use a function that calculates the value for each member:

```js
  template: '\{{#boxes:b}}\{{ getArea(b) }}\{{/}}',
  data: {
    boxes: [
      { width: 20, height: 40 },
      { width: 30, height: 45 },
      { width: 20, height: 20 }
    ],
    getArea: function ( i ) {
      var box = this.get( 'boxes.' + i );
      return box.width * box.area;
    }
  }
```

Or leverage a component to "scope" the data to each item:

```js
Box = Ractive.extend({
  template: boxTemplate,
  computed: { area: '${width} * ${height}' }
});

new Ractive({
  template: '\{{#boxes}}<box/>\{{/}}',
  data: {
    boxes: [
      { width: 20, height: 40 },
      { width: 30, height: 45 },
      { width: 20, height: 20 }
    ]
  },
  components: { box: Box }
});
```
