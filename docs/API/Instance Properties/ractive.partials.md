---
title: ractive.partials
---
Instance-specific {{{createLink 'partials'}}} exist as properties of `ractive.partials`.

Ordinarily, these are declared as an {{{createLink 'options' 'initialisation option'}}}. However it is possible, should you need to, to add or replace these partials (obviously, doing so wouldn't affect partials that were already rendered):

```js
ractive.partials.rickroll = '<iframe width="420" height="315" src="http://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>'
```

Where necessary, partials will be [parsed](ractive-parse) at the point of use, and stored as parsed partials thereafter.

If Ractive encounters a partial mustache, e.g. `\{{>rickroll}}`, it will look for instance-specific partials before looking in {{{createLink 'ractive-partials-global' 'Ractive.partials'}}}.
