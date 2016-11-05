---
title: Ractive.partials
---
{{{createLink 'Partials'}}} can be made globally available to Ractive instances by adding them to `Ractive.partials`:

```js
Ractive.partials.rickroll = '<iframe width="420" height="315" src="http://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>'
```

Where necessary, partials will be [parsed](ractive-parse) at the point of use, and stored as parsed partials thereafter.

If Ractive encounters a partial mustache, e.g. `\{{>rickroll}}`, it will look for {{{createLink 'ractive-partials-instance' 'instance-specific partials'}}} before looking in `Ractive.partials`.
