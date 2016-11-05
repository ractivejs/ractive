---
title: ractive.container
---
Each component instance that is in a yielded fragment has a container instance that is accessible using `this.container`.

```html
<foo>
  <bar>
    <baz />
  </bar>
</foo>
```

If `bar` `\{{yield}}`s, then `baz`'s container will be the `foo` instance.
