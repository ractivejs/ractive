---
title: Mustaches
---

## What is Mustache?

[Mustache](http://mustache.github.com) is one of the most popular templating languages. It's a very lightweight, readable syntax with a comprehensive specification - which means that implementations (such as Ractive) can test that they're doing things correctly.

If you've used [Handlebars](http://handlebarsjs.com) or [Angular](http://angularjs.org) you'll also find mustaches familiar.

* [What are mustaches?](#what)
* [Mustache basics](#basics)
  * [Variables](#variables)
  * [Sections](#sections)
  * [Comments](#comments)
  * [Partials](#partials)
  * [Custom delimiters](#delimiters)
* [Extensions](#extensions)
  * [Array indices](#indices)
  * [Object iteration](#object-iteration)
  * [Special references](#special-refs)
  * [Restricted references](#restricted-refs)
  * [Expressions](#expressions)
  * [Handlebars-style sections](#handlebars)
  * [Aliasing](#aliasing)
  * [Static mustaches](#static)
  * [`\{{else}}` and `\{{elseif}}`](#else)
  * [Escaping Mustaches](#escaping)


<a name="what"></a>
## What are mustaches?

Within this documentation, and within Ractive's code, 'mustache' means two things - a snippet of a template which uses mustache delimiters, such as `\{{name}}`, and the object within our {{{createLink 'parallel DOM'}}} that is responsible for listening to data changes and updating the (real) DOM.

We say that the `\{{name}}` mustache has a *[reference](references)* of `name`. When it gets rendered, and we create the object whose job it is to represent `name` in the DOM, we attempt to *resolve the reference according to the current context stack*. For example if we're in the `user` context, and `user` has a property of `name`, `name` will resolve to a {{{createLink 'keypaths' 'keypath'}}} of `user.name`.

As soon as the mustache knows what its keypath is (which may not be at render time, if data has not yet been set), it registers itself as a *{{{createLink 'dependants' 'dependant'}}}* of the keypath. Then, whenever data changes, Ractive scans the dependency graph to see which mustaches need to update, and notifies them accordingly.

<a name="basics"></a>
## Mustache basics

If you already know Mustache, Ractive supports all the Mustache features - basic Mustache variables like `\{{name}}`, as well as sections, partials, and even delimiter changes. If you're already familiar with Mustache, skip to the Extensions section below.

You can also check out the [tutorials](http://learn.ractivejs.org).

<a name="variables"></a>
### Variables

The most basic mustache type is the variable. A `\{{name}}` tag in a template will try to find the `name` key in the current context. If there is no `name` key in the current context, the parent contexts will be checked recursively. If the top context is reached and the name key is still not found, nothing will be rendered.

All variables are HTML escaped by default. If you want to return unescaped HTML, use the triple mustache: `\{{{name}}}`.

You can also use `&` to unescape a variable: `\{{& name}}`. This may be useful when changing delimiters (see "Set Delimiter" below).


Template:

```html
 * \{{name}}
 * \{{age}}
 * \{{company}}
 * \{{{company}}}
```

With the following data:

```javascript
{
  "name": "Chris",
  "company": "<b>GitHub</b>"
}
```

Will generate the following output:

```
 * Chris
 *
 * &lt;b&gt;GitHub&lt;/b&gt;
 * <b>GitHub</b>
```

<a name="sections"></a>
### Sections
Sections render blocks of text one or more times, depending on the value of the key in the current context.

A section begins with a pound and ends with a slash. That is, `\{{#person}}` begins a "person" section while `\{{/person}}` ends it.

The behavior of the section is determined by the value of the key.

#### False Values or Empty Lists

If the person key exists and has a value of false or an empty list, the HTML between the pound and slash will not be displayed.

Template:

```html
Shown.
\{{#person}}
  Never shown!
\{{/person}}
```

Data:

```javascript
{
  "person": false
}
```
Output:

```html
Shown.
```

#### Non-Empty Lists

If the person key exists and has a non-false value, the HTML between the pound and slash will be rendered and displayed one or more times.

When the value is a non-empty list, the text in the block will be displayed once for each item in the list. The context of the block will be set to the current item for each iteration. In this way we can loop over collections.

Template:

```html
\{{#repo}}
  <b>\{{name}}</b>
\{{/repo}}
```

Data:

```javascript
{
  "repo": [
    { "name": "resque" },
    { "name": "hub" },
    { "name": "rip" }
  ]
}
```

Output:

```html
<b>resque</b>
<b>hub</b>
<b>rip</b>
```

#### Non-False Values

When the value is non-false but not a list, it will be used as the context for a single rendering of the block.

Template:

```html
\{{#person?}}
  Hi \{{name}}!
\{{/person?}}
```

Data:

```javascript
{
  "person?": { "name": "Jon" }
}
```

Output:

```html
Hi Jon!
```

#### Inverted Sections

An inverted section begins with a caret (hat) and ends with a slash. That is  `\{{^person}}` begins a "person" inverted section while `\{{/person}}` ends it.

While sections can be used to render text one or more times based on the value of the key, inverted sections may render text once based on the inverse value of the key. That is, they will be rendered if the key doesn't exist, is false, or is an empty list.

Template:

```html
\{{#repo}}
  <b>{{name}}</b>
\{{/repo}}
\{{^repo}}
  No repos :(
\{{/repo}}
```

#### Attributes

Sections may also be used within attribute values and around attribute values. Using a conditional section around an attribute or group of attributes will exclude those attributes from the DOM when the conditional is `false` and include them when it is `true`. Using a conditional section within an attribute only affects the value of the attribute, and there may be multiple sections within an attribute value.

In the following terribly contrived example, if `big` is truthy, then the button will have a class `big` in addition to the fixed class `button`. If `planetsAligned` is truthy, the button will also get an annoying `onmousemove` attribute. **Note** that ractive directives cannot currently be placed within a section, but that may change in the future.

```html
<button class="\{{#big}}big \{{/}}button" \{{#planetsAligned}}onmousemove="alert('I am annoying...')"\{{/}}>I sure hope the planets aren't aligned...</button>
```

<a name="comments"></a>
### Comments
Comments begin with a bang and are ignored. The following template:

```html
<h1>Today\{{! ignore me }}.</h1>
```

Will render as follows:

```html
<h1>Today.</h1>
```

If you'd like the comments to show up, just use html comments and set {{{createLink 'options' 'stripComments' 'stripComments'}}} to `false`.
Comments may contain newlines.

<a name="partials"></a>
### Partials

Partials begin with a greater than sign:

```html
\{{> box}}
```

Recursive partials are possible. Just avoid infinite loops.

They also inherit the calling context. For example:

```html
\{{> next_more}}
```


In this case, `next_more.mustache` file will inherit the size and start methods from the calling context.

In this way you may want to think of partials as includes, or template expansion:

For example, this template and partial:

base.mustache:

```html
<h2>Names</h2>
\{{#names}}
  \{{> user}}
\{{/names}}
```

With `user.mustache` containing:

```html
<strong>\{{name}}</strong>
```

Can be thought of as a single, expanded template:

```html
<h2>Names</h2>
\{{#names}}
  <strong>\{{name}}</strong>
\{{/names}}
```

Partials are a very useful construct, and you can find out more about them on the {{{createLink 'partials'}}} page.

<a name="delimiters"></a>
### Custom delimiters

Custom delimiters are set with a 'Set delimiter' tag. Set delimiter tags start with an equal sign and change the tag delimiters from `\{{` and `}}` to custom strings.

```html
\{{foo}}
  \{{=[[ ]]=}}
[[bar]]
```

Custom delimiters may not contain whitespace or the equals sign.


You can also set custom delimiters using the `delimiters` and `tripleDelimiters` options in your Ractive instance.

```javascript
var ractive = new Ractive({
  el: whatever,
  template: myTemplate,
  data: {
    greeting: 'Hello',
    greeted: 'world',
    triple: '<strong>This is a triple-stache</strong>'
  },
  delimiters: [ '[[', ']]' ],
  tripleDelimiters: [ '[[[', ']]]' ]
});
```

<a name="extensions"></a>
## Extensions

Ractive is 99% backwards-compatible with Mustache, but adds several additional features.

<a name="indices"></a>
### Array index references

Index references are a way of determining where we are within a list section. It's best explained with an example:

```html
\{{#items:i}}
  <!-- within here, \{{i}} refers to the current index -->
  <p>Item \{{i}}: \{{content}}</p>
\{{/items}}
```

If you then set `items` to `[{content: 'zero'}, {content: 'one'}, {content: 'two'}]`, the result would be

```html
<p>Item 0: zero</p>
<p>Item 1: one</p>
<p>Item 2: two</p>
```

This is particularly useful when you need to respond to user interaction. For example you could add a `data-index='\{{i}}'` attribute, then easily find which item a user clicked on.

<a name="object-iteration"></a>
### Object iteration

Mustache can also iterate over objects, rather than array. The syntax is the same as for Array indices. Given the following ractive:

```javascript
ractive = new Ractive({
  el: container,
  template: template,
  data: {
    users: {
      'Joe': { email: 'joe@example.com' },
      'Jane': { email: 'jane@example.com' },
      'Mary': { email: 'mary@example.com' }
    }
  }
});
```

We can iterate over the users object with the following:

```html
<ul>
  \{{#users:name}}
    <li>\{{name}}: \{{email}}</li>
  \{{/users}}
</ul>
```

to create:

```html
<ul>
  <li>Joe: joe@example.com</li>
  <li>Jane: jane@example.com</li>
  <li>Mary: mary@example.com</li>
</ul>
```

In previous versions of Ractive it was required to close a section with the opening keypath. In the example above `\{{#users}}` is closed by `\{{/users}}`. This is no longer the case, you can now simply close an iterator with `\{{/}}`. Ractive will attempt to warn you in the event of a mismatch, `\{{#users}}` cannot be closed by `\{{/comments}}`. This will not effect {{{createLink 'Expressions'}}} as they have always been able to be closed by `\{{/}}`.

```html
<!--- valid markup -->
\{{#users}}

\{{/users}}

\{{#users:i}}

\{{/users}}

\{{#users}}

\{{/}}

\{{#users.topUsers}}
<!-- still matches the first part of the keypath, thus a valid closing tag -->
\{{/users}}

<!-- invalid markup -->
\{{#users}}

\{{/comments}}
```

<a name="special-refs"></a>
### Special references

There are a few implicit variables that are available anywhere within a ractive template.

* `@index` is a reference to the index or key name of the nearest iterative section. It is available even if an index name is not supplied for the section.
  ```html
  \{{#items}}\{{@index + 1}} - \{{.}}\{{/}}
  ```
* `@key` is a reference to the current key in the nearest object iterator section.
* `@keypath` is the current context used to resolve references.
  ```html
  \{{#foo}}\{{#bar}}\{{@keypath}} - foo.bar\{{/}}\{{/}}
  \{{#items}}\{{#.condition}}\{{@keypath}} - for the first item will be items.0.condition\{{/}}\{{/}}
  ```
  `@keypath` is particularly useful when aliasing is used and the current context outside of the aliasing is hidden.

<a name="restricted-refs"></a>
### Restricted references

Normally, references are resolved according to a specific algorithm, which involves *moving up the context stack* until a property matching the reference is found. In the vast majority of cases this is exactly what you want, but occasionally (for example when dealing with {{{createLink 'partials' 'recursive partials' 'recursive-partials'}}}) it is useful to be able to specify more specific directives about the context of a property being referenced.

See {{{createLink 'References' 'References' 'restricted-references'}}} for all available reference restrictions.

<a name="expressions"></a>
### Expressions

Expressions are a big topic, so they have a {{{createLink 'Expressions' 'page of their own'}}}. But this section is about explaining the difference between vanilla Mustache and Ractive Mustache, so they deserve a mention here.

Expressions look like any normal mustache. For example this expression converts `num` to a percentage:

```html
<p>\{{ num * 100 }}%</p>
```

The neat part is that this expression will recognise it has a dependency on whatever keypath `num` resolves to, and will re-evaluate whenever the value of `num` changes.

Mustache fans may bristle at expressions - after all, the whole point is that mustache templates are *logic-less*, right? But what that really means is that the logic is *embedded in the syntax* (what are conditionals and iterators if not forms of logic?) rather than being language dependent. Expressions just allow you to add a little more, and in so doing make complex tasks simple.


<a name="handlebars"></a>
### Handlebars-style sections

In addition to Mustache-style conditional and iterative sections, Ractive adds Handlebars-style ```if```, ```unless```, ```each```, and ```with``` to handle branching, iteration, and context control. For ```if```, ```with```, and ```each```, <a href="#else">```\{{elseif}}``` and ```\{{else}}```</a> may be used to provide alternate branches for false conditions, missing contexts, or empty iterables.

```html
<button on-click="flip">Flip Coin</button>
<p>Coin flip result: \{{#if heads}}heads\{{else}}tails\{{/if}}</p>
<ul>
  \{{#each result}}
    <li>\{{.}}</li>
  \{{else}}
    <li>No results yet...</li>
  \{{/each}}
</ul>
<p>Here is a \{{#with some.nested.value}}\{{.}}\{{/with}} value.</p>
```

```js
var ractive = new Ractive({
  el: document.body,
  template: myTemplate,
  data: {
    results: [],
    heads: true,
    some: { nested: { value: 'nested' } }
  }
});

ractive.on('flip', function() {
  var sadRandom = Math.floor(Math.random() * 2) === 1;
  this.set('heads', sadRandom);
  this.unshift('results', sadRandom ? 'heads' : 'tails');
});
```

In this example, clicking the button gets a "random" coin flip result, sets it in an ```if``` conditional section, and prepends it in an ```each``` iterative section. There is also a ```with``` context section throw in for good measure.


<a name="aliasing"></a>
### Aliasing

Any section (or `\{{#with}}` section) provides its own context to the template that falls within it, and any references within the section will be resolved against the section context. Ambiguous references are resolved up the model hierarchy _and_ the context hierarchy. Given a data structure that looks like
```js
{
  foo: {
    baz: 99,
    bar: {
      baz: 42
    }
  },
  list: [
    baz: 198,
    bar: {
      baz: 84
    }
  ]
}
```
and a template
```html
\{{#each list}}
  explicit 1: \{{.bar.baz}}
  \{{#with .bar}}
    implicit 1: \{{baz}}
    \{{#with ~/foo}}
      explicit 2: \{{.bar.baz}}
      implicit 2: \{{baz}}
    \{{/with}}
  \{{/with}}
\{{/each}}
```
there is no way to reference `~/list.0.baz` from the second implicit site because the site has a different context (`~/foo`) and using an ambiguous reference (`baz`) results in `~/foo.baz`  being used. Aliasing offers an escape hatch for similarly complex scenarios where ambiguity can cause the wrong reference to be used or performance issues to arise, because ambiguity is expensive.

Alias block use the existing `\{{#with}}` mustache, but instead of setting a context, they set names for one or more keypaths. Aliases follow the form `destination as alias`, where destination is any valid reference at that point in the template e.g. `\{{#with .foo as myFoo, @key as someKey, 10 * @index + ~/offset as someCalculation, .baz.bat as lastOne}}`. Because plain reference aliases, like the `myFoo` and `lastOne` aliases in the example, refer to exactly one non-computed keypath, they can also be used for two-way binding deeper in the template. For example, `<input value="\{{myFoo}}" />` as a child of the alias block would bind to `.foo` in the context where the alias block is defined.

Aliasing is also extended to `\{{#each}}` blocks so that the iterated item can be named rather than just referred to as `this` or `.`. For instance, `\{{#each list as item}}` would make `item` equivalent to `this` directly within the `each` block, but `item` would still refer to same value in further nested contexts. Index and key aliases can still be used with an aliased iteration e.g. `\{{#each object as item: key, index}}`.

Finally, partials can also be used with alias shorthand in much the same way that they can be passed context e.g. `\{{>somePartial .foo.bar as myBar, 20 * @index + baz as myComp}}`.

<a name="static"></a>
### Static mustaches

Sometimes it is useful to have portions of a template render once and stay the same even if their references change. A static mustache will be updated only when its template is rendered and not when its keypath is updated. So, if a static mustache is a child of a section or partial that get re-rendered, the mustache will also be re-rendered using the current value of its keypath.

The default static mustache delimiters are `[[ ]]` for escaped values and `[[[ ]]]` for unescaped values.

```html
[[ foo ]] \{{ foo }}
\{{^flag}}
  [[ foo ]]
\{{/}}
```

```js
var ractive = new Ractive({
  data: { foo: 'bar' },
  ...
});
ractive.set('foo', 'bippy');
ractive.set('flag', true);
ractive.set('flag', false);
```

Output:
```html
bar bippy bippy
```

Static mustaches may also be used for sections that should only be updated on render.

```html
[[# if admin ]]
Hello, admin
[[else]]
Hello, normal user
[[/if]]
```

```js
var ractive = new Ractive({
  data: { admin: false },
  ...
});
ractive.set('admin', true);
```

Output:
```
Hello, normal user
```


<a name="else"></a>
### \{{else}} and \{{elseif}}
Ractive borrows a trick from Handlebars here and lets you perform:

```html
\{{#repo}}
  <b>{{name}}</b>
\{{else}}
  No repos :(
\{{/repo}}
```

Data:

```javascript
{
  "repo": []
}
```

Output:

```html
No repos :(
```

Ractive takes it a step further and also allows you to use `\{{elseif otherCondition}}` for alternate cases.

```html
\{{#if foo}}
  foo
\{{elseif bar}}
  bar but not foo
\{{else}}
  neither foo nor bar
\{{/if}}
```

In this case, the output would be what you would expect. If `foo` is true, then the output will be `foo`. If `foo` is false and `bar` is true, the the output will be `bar but not foo`. If neither `foo` nor `bar` is true, the the output will be `neither foo nor bar`.

Further, `\{{else}}` and `\{{elseif}}` clauses can be used with `\{{#with}}` and `\{{#each}}` sections too. If the context for the `\{{#with}}` section doesn't exist, then any else clauses will be processed as if the entire section were a conditional with a false first branch. If the array for the `\{{#each}}` (or regular iterative section) is empty or the object has no keys, then any else clauses will be processed as if the entire section were a conditional with a false first branch.


<a name="escaping"></a>
### Escaping mustaches

If you need to have Ractive ignore some mustaches in your template, you can escape them with a '\\'.

```html
\{{ interpolated }} {{backslash}}\{{ left alone }}
```

If you need to have a backslash before an interpolated mustache, you can escape the backslash with another '\\'. Any additional mustaches will be exported into the template.

```html
{{backslash}}{{backslash}}\{{ interpolated }} and preceeded by a single slash.
{{backslash}}{{backslash}}{{backslash}}\{{ interpolated }} and preceeded by two slashes.
```


## Footnote

*Ractive implements the Mustache specification as closely as possible. 100% compliance is impossible, because it's unlike other templating libraries - rather than turning a string into a string, Ractive turns a string into DOM, which has to be restringified so we can test compliance. Some things, like lambdas, get lost in translation - it's unavoidable, and unimportant.
