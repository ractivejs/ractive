---
title: ractive.resetPartial()
---

Resets a partial and re-renders all of its use-sites, including in any components that have inherited it. If a component has a partial with a same name that is its own, that partial will not be affected.

Inline partials that don't belong directly to a Ractive instance aren't affected by `resetPartial`.

```js
ractive = new Ractive({
  // ...,
  partials: { foo: 'foo' }
});

// \{{>foo}} will be replaced with 'foo'

ractive.resetPartial('foo', 'bar');

// \{{>foo}} will be replaced with 'bar'
```

> ### ractive.resetPartial(name, partial)
> Returns a `Promise` (see {{{createLink 'Promises'}}})

> > #### name *`String`*
> > The partial to reset.

> > #### partial *`String`*|*`Object`*|*`Function`*
> > The new partial to use in place of the one identified by `name`.
> > * `String` - will be parsed as a template
> > * `Object` - should be a pre-parsed template
> > * `Function` - should return either a string or pre-parsed template
