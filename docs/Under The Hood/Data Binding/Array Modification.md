---
title: Array modification
---
Ractive can intercept the *mutator methods* (`pop`, `push`, `shift`, `unshift`, `splice`, `sort` and `reverse`) of arrays that it [depends on](dependants) for more convenient data binding.

Consider the following:

```html
<ul>
  \{{#list}}
    <li>\{{this}}</li>
  \{{/list}}
</ul>
```

```js
list = [ 'a', 'b', 'c' ];

ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  data: { list: list }
});

list.push( 'd' ); // adds a new list item - <li>d</li>
```

You can enable this behaviour by passing in `modifyArrays: true` as an {{{createLink 'options' 'initialisation options'}}}


## How it works

Don't worry, we're not modifying `Array.prototype`. (What do you think this is, [Ember](http://emberjs.com/guides/configuring-ember/disabling-prototype-extensions/)? :-)

Instead, we're using a technique called [prototype chain injection](http://perfectionkills.com/how-ecmascript-5-still-does-not-allow-to-subclass-an-array/#wrappers_prototype_chain_injection), which allows us to remain performant and memory-efficient without mucking about extending native objects.

This uses the non-standard (but very unlikely to disappear!) `__proto__` property. That might seem kludgy, but if [Mike Bostock thinks it's okay](http://bost.ocks.org/mike/selection/#subclass) then that's good enough for us.

Older browsers (I'm looking at you, IE8) don't support `__proto__` - in these cases, we simply add the wrapped methods as properties of the array itself.

As well as intercepting or wrapping the mutator methods, Ractive adds a (non-enumerable, in modern browsers) `_ractive` property to arrays, which contains information about which Ractive instances depend on the array, and which keypaths it is assigned to.


## Hygiene

When an array is no longer depended on by any Ractive instances, we can revert it to its normal state - resetting its prototype (if we used prototype chain injection) or deleting the wrapped methods (if we're in a crap browser), and removing the `_ractive` property.


## Performance and UI benefits

As well as convenience, using arrays like this helps Ractive make smart decisions about how to update the DOM. Continuing the example above, compare these two alternative methods of inserting a new item at the *start* of our list:

```js
// at the moment, list = [ 'a', 'b', 'c', 'd' ]

// 1. Reset the list:
ractive.set( 'list', [ 'z', 'a', 'b', 'c', 'd' ] )

// 2. Use `unshift`:
list.unshift( 'z' );
```

In the first example, Ractive will see that the content of the first list item has changed from `'a'` to `'z'`, and that the second has changed from `'b'` to `'a'`, and so on, and update the DOM accordingly. It will also see that there is now a fifth item, so will append `<li>d</li>` to the list.

In the second example, Ractive will understand that all it needs to do is insert `<li>z</li>` at the start of the list, leaving everything else untouched.

This is particularly important if you're using {{{createLink 'transitions'}}}, as it will be obvious to the user which elements are being added and removed.

Note that if `list.unshift('z')` isn't an option, you could use {{{createLink 'ractive.merge()'}}} to achieve the same effect.
