---
title: Valid Selectors
---
When creating a new Ractive instance, the `el` option can be an element, a jQuery (or equivalent) collection, or a string.

If it's a string, it will first be treated as an ID. If there is no element on the page whose ID matches the string, Ractive will treat the string as a CSS selector and use `document.querySelector`.


## jQuery collections

What do we mean by 'jQuery (or equivalent) collection'? A jQuery collection is the result of doing `$(selector)`, e.g. `$('#container')`. It looks a lot like an array of elements:

```js
var container, $container;

container = document.getElementById( 'container' );
$container = $( '#container' );

alert( container === $container[0] ); // alerts true
```

So Ractive isn't looking for any particular jQuery-ish property, it's just seeing if we've got an array-like object where the first member is an `Element`. If so, it will take the first member (even if the collection contains many members).