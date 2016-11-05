---
title: Ractive.getCSS()
---
Returns scoped CSS from Ractive subclasses defined at the time of the call.

If used without arguments, it will return the scoped CSS of all subclasses.

```js
const Subclass1 = Ractive.extend({
    ...
    css: 'div{ color: red }'
    ...
});

const Subclass2 = Ractive.extend({
    ...
    css: 'div{ color: green }'
    ...
});

// css contains the scoped versions of div{ color: red } and div{ color: green }
const css = Ractive.getCSS();
```

If provided an array of scoping IDs, it will return the scoped CSS of all subclasses whose scoping ID is included in the array.

```js
// Assuming the generated ID for this subclass is 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
const Subclass1 = Ractive.extend({
    ...
    css: 'div{ color: red }'
    ...
});

// Assuming the generated ID for this subclass is 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy'
const Subclass2 = Ractive.extend({
    ...
    css: 'div{ color: green }'
    ...
});

// css contains the scoped version of div{ color: red } only
const css = Ractive.getCSS([ 'xxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' ]);

```

> ### ractive.getCSS()
> Returns a `string` containing the scoped CSS of all subclasses.
>
> ### ractive.getCSS( scopingIds )
> Returns a `string` containing the scoped CSS of all subclasses whose scoping ID is included in the array.
>
> > #### scopingIds *`Array`*
> > An array of subclass CSS scoping ids.
