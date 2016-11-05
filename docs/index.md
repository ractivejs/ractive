---
title: Overview
---

## Welcome!

Thanks for swinging by to have a look at Ractive.js! This document is here to try to give you the slightly-closer-than-mile-high overview of what Ractive is and what it does while also providing links to more detailed sections of the documentation. Since you're here, you probably have a pretty good idea of what Ractive does, but in case you don't: Ractive is a relatively unopinionated library that makes creating interactive and reactive views for your data easy. Technically speaking, Ractive is a Model-View-Viewmodel library where you supply data for the Model and a template for the View, and Ractive handles the rest of it for you.

## Init - or - getting an instance

Before you can do anything with Ractive, you need to create a Ractive instance. There are a number of different ways to do so that will be addressed later, but the simplest is to use `new` and pass in whatever options you like. The most common options are `el`, `data`, and `template`. `el` is the target element on the page where your Ractive instance should render. It can be an actual reference to a DOM element or a CSS selector string. `data` and `template` will be addressed shortly, so for now, consider this to be the basis of all further mention of your Ractive instance: `var ractive = new Ractive({ el: '#someElement' });`.

## Data - or - the Model

There are two places that you can place your data in Ractive. Now, "your data" in this case is any JavaScript thing that you want it to be. You can stick to just JSON-compatible objects, or you can create heavy objects with methods, properties, and prototypes out of ES2015 classes, or anything in between and hand them to Ractive to use when binding a template. Data can be hierarchical, naturally, and Ractive uses keypaths to access parts or your data that are deeper than the root level. If you have special data, like Backbone models, Ractive allows you to supply adaptors that let it read and write whatever you may need.

The first place for your data in Ractive is in a Ractive instance's data registry. Every Ractive instance has a data registry that defaults to an empty object `{}` and roughly correlates to the data that you pass to other templating libraries. Note that with more complex setups, as will be discussed further on, data can also be inherited from parent instances, so each data registry behaves somewhat as a prototype for any children it may have. The data registry is the default place that Ractive looks to resolve any keypaths you hand it, so it's the best place to store data that your templates will be binding to and working with. Anything that you can assign to a variable in JavaScript can be placed into a data registry, so primitives, objects, arrays, and even functions can be used as data in Ractive.

The second place for your data is just about anywhere else. Ractive supports accessing properties of the Ractive instance and your environment's global object from both templates and API methods, so you can keep things like helper functions and other more globally scoped things outside of your data registry if you like. Note that Ractive won't know if you change anything outside of its data registry unless you tell it, so unless you use the Ractive API to make the change, you'll have to specifically tell Ractive what changed in order to have the changes propagate. That's why things that don't often change are better candidates for external storage than the data you work with directly in your templates.

### Keypaths

A keypath is simply a string of object keys separated by `.`s that is used to access some nested part of your data. If you had chunk of data that looked like `{ foo: { bar: { baz: 'hello' } } }`, the keypath to the `'hello'` string would be `'foo.bar.baz'`. If you happen to have object keys that contain a `.`, you can still use them in a keypath by escaping the `.` with a `\`. So switching out the `'baz'` key for `'bip.bop'`, the keypath would become `'foo.bar.bip\.bop'`.

Keypaths and arrays are a slightly odd combination because normally you'd use `path.to.array[0]` to access the first element of the given array, but with Ractive, that keypath would be represented as `'path.to.array.0'`. Ractive will parse array-style paths, but they are always converted to dot notation.

### Manipulation

Once your data has been initialized, you generally should not modify it directly, because doing so will not notify your Ractive instance that your data has changed. To modify data, Ractive instances provide a `set` method that takes a keypath and a value and updates the targeted property in the data registry. If you had a chunk of data that looked like `{ foo: { bar: { baz: 'hello' } } }`, you could update the `'hello'` string with `ractive.set( 'foo.bar.baz', 'goodbye' )`. You can also use `get` to retrieve data at a given keypath e.g. `ractive.get( 'foo.bar.baz' )` after the set would return `'goodbye'`. `set` can also take a map of keypaths with values to update multiple keypaths in one operation e.g. `set({ 'foo.bar.baz': 'hello', 'foo.bar.bat': 'goodbye' })` would update `'foo.bar.baz'` and create a new property `'bat'` on `'foo.bar'`.

There are also a number of helpful method supplied for interacting with data from your Ractive instance. `toggle` will take a truthy value at the given keypath and make it false and vice-versa. `add` will add the given number, which defaults to `1`, to the given keypath. `subtract` will subtract the given number, which also defaults to `1`, from the given keypath. `splice`, `shift`, `unshift`, `push`, and `pop` are special handlers that will perform the same operations as their JavaScript analogues, but in a more performant way with regards to the DOM updates that may go along with them.

Any keypaths that don't exist when set will automatically have objects added as necessary to create them, so with an empty data registry, `set( 'foo.bar.baz', 'hello' )` will create an object `{ bar: { baz: 'hello' } }` and assign it to the `'foo'` property on the root of the registry. Similarly, `get`ting a keypath that doesn't exist will not throw, but will instead return `undefined`.

Now that you have your data and know how to work with it, let's see what we can do with the view.

## Templates - or - the View

Ractive uses it's own flavor of Mustache with a strong influence from Handlebars as its template language because Mustache templates are fairly easy to grasp for anyone with any experience with HTML and any sort of templating. Unlike Mustache and Handlebars, Ractive does not operate on templates at the string level. Instead, it creates a virtual DOM from your template and uses it to keep the browser DOM in sync with your data. Since the templates aren't string-based, there are certain things that you can do with Mustaches that you can't do with Ractive, with the main one being conditionally closing one element and opening another. For instance `<div>Some stuff...\{{#if condition}}</div><div>\{{/if}}... some other stuff</div>` is not possible in Ractive because there's no way to represent an element that may become two elements in DOM. That's the main corner case that differentiates Ractive's Mustache flavor from others.

### Interpolators

The simplest interesting unit of template in Ractive is the interpolator, which takes some expression and renders it into the DOM. Ractive supports four distinct but closely related forms of interpolator that are differentiated by their mustache delimiters. Plain mustaches `\{{ ... }}` will safely render their content as a string, escaping any HTML out as entity references. Triple mustaches `\{{{ ... }}}` do the same except they do not escape any HTML in their content. Static mustaches `[[ ... ]]` behave like plain mustaches except that they only bind once, which means that they aren't kept up to date with their source data. Triple static mustaches `[[[ ... ]]]` don't escape HTML and only bind once.

Mustache delimiters can be set globally using `Ractive.defaults`, per instance using an option, or inline in the template using the Mustache syntax e.g. `\{{=<% %>=}}` to use `<% ... %>` as a plain mustache. The option names for the various delimiters are	`delimiters` for plain mustaches, `tripleDelimiters` for triples, `staticDelimiters` for static mustaches, and `staticTripleDelimiters` for static triples. Values for each of those options should be an array with the start and end delimiter e.g. `[ '<%', '%>' ]`.

### References

To bind data into your template using an interpolator, you would use its keypath as a reference in the interpolator. If you had data that looked like `{ foo: { bar: { baz: 'world' } } }`, you could bind it into your template with `{{ foo.bar.baz }}`. Since `'foo.bar.baz'` is a keypath that resolves to data in your registry, and it is also a non-static mustache, any time you `set` `'foo.bar.baz'` in some way, the interpolator that references it will be updated.

You can also use a variable in array notation to access keypaths dynamically using what Ractive calls a reference expression. Reference expressions look like `foo[bar].baz` in a template, where `'bar'` is a separate reference that should resolve to a key on `'foo'`. Any time `'bar'` or `'foo'` or the value at the combined keypath changes, the reference expression will be notified and update as well.

### Expressions

Beyond references, you can also use many valid JavaScript expressions in your templates to perform computations with your data. Among the support expressions are any literals (object, array, number, boolean, etc), function calls, ternary conditionals, and binary operators.

#### Aliases

### Conditionals

### Iteration

### Special references

### Partials

## Interactivity

### Two-way binding

### Events

## More complex structures

### Components

### Decorators

### Transitions

## Deployment

### Templates
