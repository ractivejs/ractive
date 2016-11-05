---
title: Keypaths
---
The main way to interact with a Ractive instance is by setting *keypaths*. A keypath is a string representing the location of a piece of data:

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: {
    foo: {
      bar: 'baz'
    }
  }
});

// Simple keypath
ractive.get( 'foo' ); // returns { bar: 'baz' }

// Compound keypath
ractive.get( 'foo.bar' ); // returns 'baz'
```

## Upstream and downstream keypaths

In the example above, we say that `'foo.bar'` is a *downstream keypath* of `'foo'`, while `'foo'` is an *upstream keypath* of `'foo.bar'`.

## Array versus dot notation

The `'foo.bar'` keypath is an example of *dot notation*. With arrays, you can use dot notation or *array notation*, which may feel more familiar (internally, it gets converted to dot notation):

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: {
    list: [ 'a', 'b', 'c' ]
  }
});

// Array notation
ractive.get( 'list[0]' ); // returns 'a'

// Dot notation
ractive.get( 'list.0' ); // also returns 'a'
```

## Missing properties

Ordinarily in JavaScript, trying to access a child property of an object that didn't exist would cause an error:

```js
data = { numbers: [ 1, 2, 3 ]};
data.letters[0]; // throws an error - cannot read property '0' of undefined
```

Within Ractive, this will simply return `undefined`:

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: {
    numbers: [ 1, 2, 3 ]
  }
});

ractive.get( 'letters[0]' ); // returns undefined
```

## Escaping

While not ideal, sometimes properties of objects have `.`s in name e.g. `foo['bar.baz']`. Note that while numbers are supported in array notation, strings are not. To access a peypath with a literal `.` in one of the keys, you can escape it with a `\` e.g. `foo.bar\.baz`. Any keys accessible in the template will be unescaped, so if you're trying to use them with simple string concatenation to access a keypath with a `.` in it, you'll need to make sure you escape it first.
