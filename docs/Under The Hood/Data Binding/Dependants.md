---
title: Dependants
---

Ractive maintains a *dependency graph* in order to do the minimum amount of work necessary to keep the DOM up-to-date.

If you inspect a Ractive instance in your console, you'll see a property called `_deps`. This is where all dependants are listed, indexed by their dependency.

There is also a concept of 'priority', which exists to save us some work. If, for example, a section needs to be removed (perhaps it's a conditional section, and the condition just went from truthy to falsy), there is no point in updating all its children, so we make sure that we teardown the section first. As part of that teardown process, the children - which all have lower priority - unregister themselves as dependants before they get a chance to update.

## Indirect dependencies

If you have a mustache which depends on `foo.bar`, and `foo` changes, it's quite possible that the mustache needs to re-render. We say that the mustache has an *indirect dependency* on `foo`, or that it has a *direct dependency on a downstream keypath* of `foo`.

This relationship is expressed through the `_depsMap` property of a Ractive instance - whenever `foo` changes, as well as dealing with direct `foo` dependants we check the map for those indirect dependants.

In the case of {{{createLink 'expressions'}}} and {{{createLink 'observers'}}}, we also need to consider dependants of *upstream keypaths*. For example, suppose we have a section based on a sorted array - if we modify one of the members of the array, we need to see if the sort order has changed or not as a result:

```html
\{{#( sort( list, 'name' ) )}}
  <p>\{{name}}</p>
\{{/()}}
```

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: {
    list: [{ name: 'Bob' }, { name: 'Charles' }, { name: 'Alice' }],
    sort: function ( list, property ) {
      return list.slice().sort( function ( a, b ) {
        return a[ property ] < b[ property ] ? -1 : 1;
      });
    }
  }
});

// renders Alice, Bob, Charles

ractive.set( 'list[0].name', 'Zebediah' );

// updates to Alice, Charles, Zebediah
```

In the example, setting `list[0].name` causes dependants of `list` to be updated.

As well as {{{createLink  'expressions'}}}, {{{createLink 'Observers'}}} respond to both upstream and downstream changes.


## Expressions with multiple dependencies

The expression `\{{ a + b }}` has two dependencies - `a` and `b` (or more accurately, whatever those {{{createLink 'references'}}} resolve to). The `_deps` graph actually includes objects representing those individual references, rather than the expression itself - the reference objects then notify the expression (if their value has changed) that it will need to re-evaluate itself.

Because the expression has multiple dependencies, it won't trigger an update straight away - it will wait until all the new data has come in first. So doing `ractive.set({ a: 1, b: 2 })` will only trigger one update, not two.