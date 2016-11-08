---
title: Expressions
---
Expressions allow you to use logic within a template. At their simplest, that may just mean a basic arithmetic operation, such as converting to percentages, or making your {{{createLink 'mustaches' 'index references' 'index-references'}}} start at 1 rather than 0:

```html
<div class='bar-chart'>
  \{{#bars:i}}
    <div style='width: \{{ value * 100 }}%;'>\{{ i + 1 }}</div>
  \{{/bars}}
</div>
```

Or it could mean formatting a currency so that `1.79` renders as `£1.79p`:

```html
<p>Price: <strong>\{{ format( price ) }}</strong></p>
```

Or it could mean adding a class based on some condition:

```html
<a class='button \{{ active ? "on" : "off" }}'>switch</a>
```

Or it could mean filtering a list to exclude certain records:

```html
<ul>
\{{# exclude( list, 'N/A' ) }}
  <li>\{{author}}: \{{title}}</li>
\{{/ end of filter }}
</ul>
```

These are all examples casually plucked from the air - whether they would be useful or not in real life depends on what you're trying to do. The point is that you can include more of your view logic at the declarative layer - the template - where it's easier to *reason about*.

## Frequently Used Expressions

If you use a particular expression frequently, you can save time by adding it Ractive's default data. This way you won't have to set up the expressions on each individual `ractive` instance.

The example below adds expressions for some frequenlty used parts of [moment.js](http://momentjs.com/) to the default data:

```js
var helpers = Ractive.defaults.data;
helpers.fromNow = function(timeString){
	return moment(timeString).fromNow()
}
helpers.formatTime = function(timeString){
	return moment(timeString).format("ddd, h:mmA");
}
helpers.humanizeTime = function(timeString){
	return moment.duration(timeString).humanize();
}
```

## Valid expressions

These are, of course, JavaScript expressions. Almost any valid JavaScript expression can be used, with a few exceptions:

* No assignment operators (i.e. `a = b`, `a += 1`, `a--` and so on)
* No `new`, `delete`, or `void` operators
* No function literals (i.e. anything that involves the `function` keyword)

Aside from a subset of global objects (e.g. `Math`, `Array`, `parseInt`, `encodeURIComponent` - full list below), any references must be to properties (however deeply nested) of the Ractive instance's data, rather than arbitrary variables. Reference resolution follows the {{{createLink 'references' 'normal process'}}}.


## Does this use `eval`?

Yes and no. You've probably read that 'eval is evil', or some other such nonsense. The truth is that while it does get abused, and can theoretically introduce security risks when user input gets involved, there are some situations where it's both necessary and sensible.

But repeatedly `eval`ing the same code is a performance disaster. Instead, we use the `Function` constructor, which is a form of `eval`, except that the code gets compiled once instead of every time it executes.


## A note about efficiency

Using the `Function` constructor instead of `eval` is just one way that Ractive optimises expressions. Consider a case like this:

```html
\{{a}} + \{{b}} = \{{ a + b }}
\{{c}} + \{{d}} = \{{ c+d }}
```

At *parse time*, Ractive generates an [abstract syntax tree](http://en.wikipedia.org/wiki/Abstract_syntax_tree) (AST) from these expressions, to verify that it's a valid expression and to extract any references that are used. It then 'stringifies' the AST, so that the expression can later be compiled into a function.

As anyone who has seen minified JavaScript can attest, JavaScript cares not one fig what your variables are called. It also doesn't care about whitespace. So both of the expressions can be stringified the same way:

```js
"_0+_1"
```

When we *evaluate* `\{{ a + b }}` or `\{{ c+d }}`, we can therefore use the same function but with different arguments. Recognising this, the function only gets compiled once, after which it is cached. (The cache is shared between all Ractive instances on the page.) Further, the result of the evaluation is itself cached (until one or more of the dependencies change), so you can repeat expressions as often as you like without creating unnecessary work.

All of this means that you could have an expression within a list section that was repeated 10,000 times, and the corresponding function would be created once *at most*, and only called when necessary.


## The `this` reference

Within an expression, you can use `this` to refer to the current *context*:

```html
<ul>
  \{{#items}}
    <!-- here, `this` means 'the current array member' -->
    <li>\{{this.toUpperCase()}}</li>
  \{{/items}}
</ul>
```

In regular mustache, we have something called the *implicit iterator* - `\{{.}}` - which does the same thing. Ractive allows you to use `this` in place of `.` for purely aesthetic reasons.


## Supported global objects

* `Array`
* `Date`
* `JSON`
* `Math`
* `NaN`
* `RegExp`
* `decodeURI`
* `decodeURIComponent`
* `encodeURI`
* `encodeURIComponent`
* `isFinite`
* `isNaN`
* `null`
* `parseFloat`
* `parseInt`
* `undefined`

## Functions

Any functions that you want to call, outside of the available globals above, must be properties of the Ractive instance's data as well. Functions can also depend on other references and will be re-evaulated when one of their dependencies is changed.

Depedendencies are determined by capturing references in the viewmodel while the function is executing. Dependencies for functions are re-captured each time the function is executed.

```html
<p>\{{ formattedName() }}</p>
```

```js
var ractive = new Ractive({
  template: template,
  el: output,
  data: {
    user: { firstName: 'John', lastName: 'Public' },
    formattedName: function() {
      return this.get('user.lastName') + ', ' + this.get('user.firstName');
    }
  }
};
```

Result:
```html
<p>Public, John</p>
```

In this example, the function ```formattedName``` will depend on both ```user.firstName``` and ```user.lastName```, and updating either (or ```user```) will cause any expressions referencing ```formattedName``` to be re-evaluated as well.

```js
ractive.set('user.firstName', 'Jane')
```

Result:
```html
<p>Public, Jane</p>
```

## Functions on helper objects and third-party libraries

You can also add helper objects to your data and call functions on those objects in expressions. For example, you could add a reference to [underscore.js](http://underscorejs.org/):

```js
var ractive = new Ractive({
  template: template,
  el: output,
  data: {
    items: [ 2, 10, 200, 3, 1, 4],
    _: _
  }
};
```

And use that to sort an array in your template:

```html
\{{# _.sortBy(items) }}\{{.}}, \{{/}}

<!-- Result: -->
1, 2, 3, 4, 10, 200,
```
