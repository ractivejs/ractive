---
title: ractive.toCSS()
---
Returns the scoped CSS of the current instance and its descendants.

```js
const Subclass = Ractive.extend({
    ...
    css: 'div{ color: red }'
    ...
});

const subclassInstance = new Subclass({...});

// Contains the scoped version of div{ color: red }
subclassInstance.toCSS();
```

At the moment, this will not work on a direct instance of Ractive and will log a warning. You can only use this method on an instance of a subclass.

```js
const ractiveInstance = new Ractive({...});

// This will log a warning.
ractiveInstance.toCSS();
```

> ### ractive.toCSS()
> Returns CSS *`String`*
