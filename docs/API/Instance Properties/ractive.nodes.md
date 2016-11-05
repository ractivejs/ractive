---
title: ractive.nodes
---
Each Ractive instance has a `nodes` property, which is a hash of all the elements within a Ractive that have an `id` attribute:

```html
<div id='myDiv'>An unimaginatively named div.</div>
```

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate
});

// this will alert 'true'
alert( ractive.nodes.myDiv === document.getElementById( 'myDiv' ) );
```

This can save you having to store references to elements, or doing repeated calls to `document.getElementById()` (or the jQuery equivalent, etc).

You can, if you're so inclined, use dynamic attributes, like so:

```html
<ul>
  \{{#items:i}}
    <li id='item_\{{i}}'>\{{content}}</li>
  \{{/items}}
</ul>
```

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: { items: myListOfItems }
});

// to get reference to an arbitrary li element...
li = ractive.nodes[ 'item_' + num ];
```
