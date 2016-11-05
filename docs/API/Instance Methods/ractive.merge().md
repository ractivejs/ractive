---
title: ractive.merge()
---

Sets the indicated keypath to the new array value, but "merges" the existing rendered nodes
representing the data into the newly rendered array, inserting and removing nodes from the DOM as necessary.
Where necessary, items are moved from their current location in the array (and, therefore, in the DOM)
to their new location.

This is an efficient way to (for example) handle data from a server. It also helps to control `intro` and `outro`
{{{createLink 'Transitions' 'transitions'}}} which might not otherwise happen with a basic
{{{createLink 'ractive.set()' }}} operation.

To determine whether the first item of `['foo', 'bar', 'baz']` is
the same as the last item of `['bar', 'baz', 'foo']`, by default we do a strict equality (`===`) check.

In some situations that won't work, because the arrays contain objects, which may *look* the same
but not be identical. To deal with these, we use the `compare` option detailed below.

Merge can also be used to created a context block that uses transitions when the context changes:

```html
\{{#user}}
<div intro='fade'>\{{first}} \{{last}}</div>
\{{/}}
```

```js
var r = new Ractive({
    el: document.body,
    template: '#template',
    data: {
        user: [{
            first: 'sam',
            last: 'smith'
        }]
    },
    complete: function(){
        this.merge('user', [{
            first: 'jane',
            last: 'johnson'
        }])
    }
})

```

> ### ractive.merge( keypath, value[, options] )
> Returns a `Promise` (see {{{createLink 'Promises'}}})

> > #### **keypath** *`String`*
> > The [keypath](keypaths) of the array we're updating
> > #### **value** *`Array`*
> > The new data to merge in
> > #### options *`Object`*
> > > #### compare *`Boolean` or `String` or `Function`*
> > > If `true`, values will be stringified (with `JSON.stringify`) before comparison. If you pass a string such as `"id"`, array members will be compared on the basis of their properties of that name. Alternatively, pass a function that returns a value with which to compare array members.
