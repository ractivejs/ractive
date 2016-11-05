---
title: ractive.link()
---

Creates a link between two {{{createLink 'keypath' 'keypaths'}}} that keeps them in sync. Since Ractive can't always watch the contents of objects, copying an object to two different keypaths in your data usually leads to one or both of them getting out of sync. `link` creates a sort of symlink between the two paths so that Ractive knows they are actually the same object. This is particularly useful for master/detail scenarios where you have a complex list of data and you want to be able to select an item to edit in a detail form.

```js
ractive.link( 'some.nested.0.list.25.item', 'current' );
ractive.set( 'current.name', 'Rich' ); // some.nested.0.list.25.item.name is also updated to be 'Rich'
```

This can be used to great effect with method events and the `@keypath` special ref:
```html
\{{#each some.nested}}
  \{{#each list}}
    \{{#with item}}
      \{{.name}}
      <button on-click="event.link('.', 'current')">Select</button>
    \{{/with}}
  \{{/each}}
\{{/each}}

Name: <input value="\{{~/current.name}}" />
```

> ### ractive.link( source, destination )
> Returns a `Promise` (see {{{createLink 'Promises'}}})

> > ### **source** *`String`*
> > The keypath of the source item.

> > ### **destination** *`String`*
> > The keypath to use as the destination - or where you'd like the data 'copied'.

Links can be removed using {{{createLink 'ractive.unlink()'}}}.
