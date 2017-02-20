# ractive.adaptors

_`(Object<string, Object>)`_

The instance-only registry of [adaptors]().

---

# ractive.components

_`(Object<string, Function>)`_

The instance-only registry of [components]().

---

# ractive.container

_`(Ractive)`_

Each component instance that is in a yielded fragment has a container instance that is accessible using `this.container`.

```html
<foo>
  <bar>
    <baz />
  </bar>
</foo>
```

If `bar` `{{yield}}`s, then `baz`'s container will be the `foo` instance.

---

# ractive.decorators

_`(Object<string, Function>)`_

The instance-only registry of [decorators]().

---

# ractive.easing

_`(Object<string, Function>)`_

The instance-only registry of [easing functions]().

---

# ractive.events

_`(Object<string, Function>)`_

The instance-only registry of [events]().

---

# ractive.fragment

TODO

---

# ractive.interpolators

_`(Object<string, Function>)`_

A key-value hash of interpolators use by [`ractive.animate()`]().

---

# ractive.nodes

_`(Object<string, HTMLElement>)`_

An object containing all of the elements inside the instance that have an `id` attribute.

```js
const ractive = new Ractive({
  el: body,
  template: '<div id="myDiv">An unimaginatively named div.</div>'
});

ractive.nodes.myDiv === document.getElementById( 'myDiv' ); // true
```

This will also reference dynamically created elements.

```js
const ractive = new Ractive({
  el: myContainer,
  template: `
    <ul>
        {{#items:i}}
            <li id='item_{{i}}'>{{content}}</li>
        {{/items}}
    </ul>
  `,
  data: { items: myListOfItems }
});

// Get a reference to an arbitrary li element.
ractive.nodes[ 'item_' + num ];
```

---

# ractive.parent

_`(Ractive)`_

Each component instance can access its parent using `this.parent`.

```html
<foo>
  <bar>
    <baz />
  </bar>
</foo>
```

`baz`'s parent is the `bar` instance, and `bar`'s parent is the `foo` instance.

---

# ractive.partials

_`(Object<string, string|Object|Function>)`_

The instance-only registry of [partials]().

---

# ractive.root

_`(Ractive)`_

Each component instance can access its root Ractive instance using `this.root`.

```html
<foo>
  <bar>
    <baz />
  </bar>
</foo>
```

`foo`, `bar`, and `baz` will all have the Ractive instance with this template as their `root`.

---

# ractive.transitions

_`(Object<string, Function>)`_

The instance-only registry of [transitions]().

---

# ractive.viewmodel

TODO
