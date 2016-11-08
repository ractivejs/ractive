The following is an exhaustive list of initialisation options that you can pass to `new Ractive(options)` and `Ractive.extend(options)`, with full descriptions grouped below by category.

Note that any additional options will be added as properties of the instance, so you can create custom methods (e.g. for calling from templates):

```js
var ractive = new Ractive({
  myMethod: function () {
    alert( 'my method was called' );
  }
});

ractive.myMethod(); // triggers the alert
```


| Option                                            | Category                               | Description |
| -----------------------------------------         | -----------                            | -----       |
| [adapt](#adapt)                                   | [data](#Data binding)                  | adaptors to use |
| [adaptors](#adaptors)                             | [data](#Data binding)                  | registry of available adaptors |
| [append](#append)                                 | [placement](#Placement)                | how to handle existing content in the dom |
| [complete](#complete)                             | [transitions](#Transitions)            | fine-tune template placement in the dom |
| [components](#components)                         | [templating](#Templating)              | components to include for use by the template |
| [computed](#computed)                             | [data](#Data binding)                  | computed properties to include |
| [csp](#csp)                                       | [parsing](#Parsing)                    | output CSP compatible templates |
| [css](#css)                                       | [templating](#Templating)              | component only css to include on render |
| [data](#data)                                     | [data](#Data binding)                  | the data to bind to the template |
| [decorators](#decorators)                         | [templating](#Templating)              | decorators to include for use by the template |
| [delimiters](#delimiters)                         | [parsing](#Parsing)                    | delimiters to use when parsing the template |
| [easing](#easing)                                 | [transitions](#Transitions)            | easing functions to use in transitions |
| [el](#el)                                         | [placement](#Placement)                | render to this element in the dom |
| [enhance](#enhance)                               | [placement](#Placement)                | try to reuse existing DOM on intial render |
| [events](#events)                                 | [templating](#Templating)              | events to include for use by the template |
| [interpolators](#interpolators)                   | [transitions](#Transitions)            | interpolators to use for animating values |
| [isolated](#isolated)                             | [data](#Data binding)                  | prevent components from accessing parent data and registries |
| [lazy](#lazy)                                     | [binding](#Data binding)               | don't bind to every keypress |
| [magic](#magic)                                   | [binding](#Data binding)               | data object getters and setters that update view |
| [modifyArrays](#modifyArrays)                     | [binding](#Data binding)               | array modification methods update the view |
| [noCssTransform](#noCssTransform)                 | [templating](#Templating)              | prevent transformation of component css |
| [noIntro](#noIntro)                               | [transitions](#Transitions)            | do not apply transitions on render |
| [onchange](#onchange)                             | [lifecycle events](#Lifecycle events)  | event fired when data changes
| [oncomplete](#oncomplete)                         | [lifecycle events](#Lifecycle events)  | event fired once transitions have completed
| [onconfig](#onconfig)                             | [lifecycle events](#Lifecycle events)  | event fired once all configuration options have been processed
| [onconstruct](#onconstruct)                       | [lifecycle events](#Lifecycle events)  | event fired immediately after `new Ractive(...)`
| [ondetach](#ondetach)                             | [lifecycle events](#Lifecycle events)  | event fired each time `ractive.detach()` is called
| [oninit](#oninit)                                 | [lifecycle events](#Lifecycle events)  | event fired when the instance is ready to be rendered
| [oninsert](#oninsert)                             | [lifecycle events](#Lifecycle events)  | event fired each time `ractive.insert()` is called
| [onrender](#onrender)                             | [lifecycle events](#Lifecycle events)  | event fired each time the instance is rendered
| [onteardown](#onteardown)                         | [lifecycle events](#Lifecycle events)  | event fired each time the instance is destroyed
| [onunrender](#onunrender)                         | [lifecycle events](#Lifecycle events)  | event fired each time the instance is unrendered
| [onupdate](#onupdate)                             | [lifecycle events](#Lifecycle events)  | event fired after `ractive.update()` is called
| [partials](#partials)                             | [templating](#Templating)              | partials to include for use by the template |
| [preserveWhitespace](#preserveWhitespace)         | [parsing](#Parsing)                    | don't normalize template whitespace |
| [sanitize](#sanitize)                             | [parsing](#Parsing)                    | remove designated elements and event attributes |
| [staticDelimiters](#staticDelimiters)             | [parsing](#Parsing)                    | one-time binding parsing delimiters |
| [staticTripleDelimiters](#staticTripleDelimiters) | [parsing](#Parsing)                    | one-time binding non-escaped parsing delimiters  |
| [stripComments](#stripComments)                   | [parsing](#Parsing)                    | remove HTML comments from templates |
| [template](#template)                             | [templating](#Templating)              | specifies the template to use |
| [transitions](#transitions)                       | [transitions](#Transitions)            | transitions to include for use by the template |
| [transitionsEnabled](#transitionsEnabled)         | [transitions](#Transitions)            | allow transitions |
| [tripleDelimiters](#tripleDelimiters)             | [parsing](#Parsing)                    | non-escaped parsing delimiters |
| [twoway](#twoway)                                 | [binding](#Data binding)               | prevent updates from the view back to the model |

# Templating

## template

_`(string|array|object|function)`_

The [template]() to use. Must either be a CSS selector string pointing to an element on the page containing the template, an HTML string, an object resulting from [`Ractive.parse()`]() or a function that returns any of the previous options.

```js
// Selector
template: '#my-template',

// HTML
template: '<p>{{greeting}} world!</p>',

// Template AST
template: {"v":3,"t":[{"t":7,"e":"p","f":[{"t":2,"r":"greeting"}," world!"]}]},

// Function
template: function(data, p){
  return '<p>{{greeting}} world!</p>';
},
```

If you need to dissect templates prior to handing them over to Ractive, the function option receives a [Parse]() helper object to provide additional details about the template.

During a [`ractive.reset()`](), function templates will be re-evaluated. If the return value changes, the Ractive instance will be re-rendered.

---

## partials

_`(Object<string, string|Object>)`_

A key-value hash of [partials]() that are specific to this instance, where `key` is the name of the partial (as referenced within templates as `{{>myPartial}}`), and `value` is either a valid template string or the output of [`Ractive.parse()`]().

```js
partials: {
  stringPartial: '<p>{{greeting}} world!</p>',
  parsedPartial: {"v":3,"t":[{"t":7,"e":"p","f":[{"t":2,"r":"greeting"}," world!"]}]}
}
```

---

## components

_`(Object<string, Function>)`_

A key-value hash of components that are specific to this instance, where `key` is the name of the component (as referenced within templates as `<my-component></my-component>`), and `value` is a valid component created by [`Ractive.extend()`]().

```js
components: {
  'my-component': Ractive.extend({
    template: '#componentTemplate',
    init: function () {...}
  })
}
```
See [Components]() for more info.

---

## decorators

_`(Object<string, Function>)`_

A key-value hash of decorators that are specific to this instance, where `key` is the name of the decorator (as referenced within templates as `<div decorator="myDecorator"></div>`), and `value` is a is a decorator functions.  See [Decorators]() for more info.

```js
decorators: {
  'myDecorator': function( node, fire) {...}
}
```

---

## events

_`(Object<string, Function>)`_

A key-value hash of [event plugins]() that are specific to this instance, where `key` is the name of the event (as referenced within templates as `<button on-mycustomevent="fire"></button>`), and `value` is the custom event plugin functions.  See [Writing Events]() for more info.

```js
events: {
  'mycustomevent': function( node, fire ) {...}
}
```

---

## css

_`(string)`_

Used on components to specify `css` styles to be inserted into the document.

---

## noCSSTransform

_`(boolean)`_

Defaults to `false`. Prevents component css from being transformed with scoping guids.

---

# Placement

## el

_`(string|HTMLElement|array-like)`_

Directives for the element to render to. Use `append` option (see below) to control whether existing content is replaced.

- `string` id or selector.
  ```js
  el: '#container'
  ```

- `HTMLElement` DOM element
  ```js
  el: document.body
  ```

- An array-like object where the first element is an `HTMLElement`.
  ```js
  el: $('#container')
  ```

Examples of array-like objects would be jQuery collections, arguments, or anything that can be accessed using an index, i.e. `arr[0]`.

---

## enhance

_`(boolean)`_

Defaults to `false`. Whether or not to try to reuse the existing DOM in the target element when rendering a.k.a. progressive enhancement. This allows you to serve the fully rendered page and then render the Ractive template at load over the pre-rendered page without completely wiping out the existing content. There are a few limitations surrounding text nodes, but all matching elements will be reused.

This option cannot be used with `append`.

To expand on the limitations with text nodes, since HTML does not have a markup representation for individual adjacent text nodes where the DOM does, the loaded DOM will have all text nodes merged when the document loads from the server. Ractive needs individual adjacent text nodes in certain situations like `outer text {{#if foo}}inner text{{/if}}`. The `'outer text '` text node is always present, and if `foo` becomes truthy, an additional text node will be inserted next to the `'outer text '` node containing `'inner text'`. It has been suggested that Ractive could also deal with merged text nodes, but that would become quite complex because there are certain scenarios where a text node would have to split and be rejoined as the model changed e.g. `outer text {{#if foo}}<span>hello</span>{{/if}} the other side`. In that case, if `foo` is initially falsey, the `'outer text '` and `' the other side'` nodes could be merged into a single node. However, if `foo` became truthy, that node would have to be split into two to place on either side of the `<span>`.

Additionally, unescaped HTML mustaches (triples) don't play nicely with enhance because there's no easy way to match up the string content to the target DOM nodes. This may be remedied at some point in the future.

TODO: Simplify/restructure

---

## append

_`(boolean|string|HTMLElement|array-like)`_

Defaults to `false`. Controls whether existing content is replace and optionally where to place the rendered content.

- `false` - rendered content replaces any existing contents of `el`

    ```html
    // dom
    <div id='container'><p>existing content</p></div>
    ```
    ```js
    // options
    el: '#container',
    append: false, //default
    template: '<p>new content</p>'
    ```
    ```html
    // result
    <div id='container'><p>new content</p></div>
    ```

- `true` rendered content is appended to `el`

    ```html
    // dom
    <div id='container'><p>existing content</p></div>
    ```
    ```js
    // options
    el: '#container',
    append: true,
    template: '<p>new content</p>'
    ```
    ```html
    // result
    <div id='container'><p>existing content</p><p>new content</p></div>
    ```

- anchor is any valid option as specified in `el` that resolves to an `HTMLElement`. Rendered content is appended to `el` before anchor, see [`ractive.insert()`]()

    ```html
    // dom
    <div id='container'><p>red</p><p>blue</p><p>yellow</p></div>
    ```
    ```js
    // options
    el: '#container',
    append: document.querySelector('p:nth-child(2)'),
    template: '<p>green</p>'
    ```
    ```html
    // result
    <div id='container'><p>red</p><p>green</p><p>blue</p><p>yellow</p></div>
    ```

---

## Data Binding

## data

_`(Object<string, any>|function)`_

The data with which to initialise.

```js
data: { foo: 'bar' }

data: function() {
  return { foo: 'bar' };
}
```

TODO: Document quirks on how the behavior differs when using this option in Components.

---

## computed

_`(Object<string, function|Object>)`_

An object that maps to a set of computed values.

```js
computed: {
  area: '${width} - ${height}'
}
```

See [Computed Properties]() for more information and examples .

---

## magic

_`(boolean)`_

Defaults to `false`. Whether or not to wrap data in ES5 accessors for automatic binding (see [Magic Mode]()).

```js
var data = { foo: 'bar' };
new Ractive({ data: data } );
// will update automagically:
data.foo = 'fizz'
```

---

## adapt

_`(Array<string|Object>)`_

Custom wrappers to be used with all or part of the supplied data, see [Adaptors](). Unlike components or other registries where there is a template-level directive that informs Ractive that plugin is to be used, adaptors are a data-level construct and so you use the `adapt` option to tell Ractive which adaptors are to be used with that instance. If you define the adaptors directly on the instance or component, you do not need to specify them in the `adapt` option.

Can either be the adaptor itself, or the name of an adaptor registred via `Ractive.adaptors`:

```js
Ractive.adaptors.myAdaptor = MyAdaptor1;

new Ractive({
  adapt: [ 'myAdaptor', MyAdaptor2 ]
})
```

---

## adaptors

_`(Object<string, Object>)`_

A key-value hash of [adaptors]() that are specific to this instance. Usually the `adapt` property can directly specify which adaptors
to use on this instance and the `adaptors` property is used to register an adaptor on components or `Ractive.adaptors`.

```js
adaptors: {
  myAdaptor: MyAdaptor
}
```

---

## modifyArrays

_`(boolean)`_

Defaults to `false`. Whether or not to modify array mutator methods to enable frictionless data binding with lists (see [Array Modification]()).

```js
var items = [ 'red', 'blue' ];
new Ractive({
  data: data,
  modifyArrays: true //default
});

// will update automagically:
items.push( 'green' );
```

---

## twoway

_`(boolean)`_

Defaults to `true`. Whether or not two-way data binding is enabled (see [Two-Way Binding]()).

```js
var ractive = new Ractive({
  template: '<input value="{{foo}}">',
  data: { foo: 'bar' },
  twoway: false
});

// user types "fizz" into <input>, but data value is not changed:
console.log( ractive.get( 'foo' ) ); //logs "bar"

// updates from the model are still pushed to the view
ractive.set( 'foo', 'fizz' );

// input now displays "fizz"
```

Also see [static delimiters](#staticDelimiters) for one-time binding

---

## lazy

_`(boolean)`_

Defaults to `false`. If two-way data binding is enabled, whether to only update data based on text inputs on `change` and `blur` events, rather than any event (such as key events) that may result in new data.

```js
var ractive = new Ractive({
  template: '<input value="{{foo}}">',
  data: { foo: 'bar' },
  lazy: true
});

// will not fire as user is typing
ractive.on('change', function(){
  // only happens on exiting <inputor return if submit
  console.log('changed!')
})
```

---

## isolated

_`(boolean)`_

Defaults to `false`. This option is typically only relevant as an extension option for [Components](). Controls whether the component will look outside itself for data and registry items.

---

# Lifecycle events

Every Ractive instance has a *lifecycle- - it is created, then rendered, and eventually may be changed and 'torn down'.

The full list of lifecycle events is as follows:

| Name            | Event is fired...
| --------------- | --------------
| `onconstruct`     | ...as soon as `new Ractive(...)` happens, before any setup work takes place
| `onconfig`        | ...once all configuration options have been processed
| `oninit`          | ...when the instance is ready to be rendered
| `onrender`        | ...each time the instance is rendered (normally only once)
| `oncomplete`      | ...after `render`, once any intro [transitions]() have completed
| `onchange`        | ...when data changes
| `onupdate`        | ...after `ractive.update()` is called
| `onunrender`      | ...each time the instance is unrendered
| `onteardown`      | ...each time the instance is destroyed (after `unrender`, if the teardown is responsible for triggering the unrender)
| `oninsert`        | ...each time `ractive.insert()` is called
| `ondetach`        | ...each time `ractive.detach()` is called (note: `ractive.insert()` calls `ractive.detach()`)

You add handlers as [initialisation options]():

```js
ractive = new Ractive({
  el: 'body',
  template: myTemplate,
  onteardown: function () {
    alert( 'Bye!' );
  }
});
```

You can also subscribe to these lifecycle events using [`ractive.on()`]() sans the `on` prefix:

```js
ractive = new Ractive({
  el: 'body',
  template: myTemplate
});

ractive.on( 'teardown', function () {
  alert( 'Bye!' );
});
```

Most of the events do not have arguments, except for:

- `construct` - Supplies the actual initialisation options provided to the instance constructor
- `change` - Supplies a change object with each change keypath as a property and the new change value as the value of that property

Built-in lifecycle events are **reserved**, which means you can't use their names as [proxy events]().


# Transitions

## transitions

_`(Object<string, Function>)`_

A key-value hash of transitions that are specific to this instance. The `key` is referenced within templates using `intro` and `outro` attributes on elements, and `value` is a transition functions, see [Transitions]() for more info.

```js
template: '<p intro="slide" outro="slide">hello world</p>',
transitions: {
  slide: function ( t, params ) {...}
}
```

---

## transitionsEnabled

_`(boolean)`_

Defaults to `true`. Whether or not transitions are enabled for this instance.

---

## noIntro

_`(boolean)`_

Defaults to `false`. Whether or not to skip intro transitions on render.

```js
var ractive = new Ractive({
  template: '<ul>{{#items}}<li intro="fade">{{.}}</li>{{/items}}</ul>',
  data: { items: [ 'red', 'blue' ] },
  transitions: { fade: function ( t, params ) {...} },
  noIntro: true
});
// 'red' and 'blue' list items do not fade in on intro

ractive.get('items').push( 'green' );
// 'green' list item will fade in
```

---

## complete

_`(Function)`_

A function that will be called when render is complete (i.e. all intro transitions have finished). If there are no intro transitions, this function will be called as soon as the instance is created)

```js
template: '<p intro="fade">hello</p>',
transitions: { fade: function ( t, params ) {...} },
complete: function () {
  console.log( '<phas completed fade in!' );
}
```

TODO: Verify if this still exists or if this was superseded by the `oncomplete` lifecycle event.

---

## easing *`Object`*

_`(Object<string, Function>)`_

A key-value hash of easing function. See [`Ractive.easing`]()

---

## interpolators

_`(Object<string, Function>)`_

A key-value hash of interpolators use by [`ractive.animate()`]().

---

# Parsing

## csp

_`(boolean)`_

Defaults to `false`. Whether or not to add inline functions for expressions after parsing. This can effectively eliminate `eval` caused by expressions in templates. It also makes the resulting template no longer JSON compatible, so the template will have to be served via `script` tag.

---

## delimiters

_`(Array[string])`_

Defaults to `[ '{{', '}}' ]`. Used to set what delimiters to use when parsing templates.

```js
template: 'hello <%= world %>',
delimiters: [ '<%=', '%>' ],
data: { world: 'earth' }

// result:
hello earth
```

---

## tripleDelimiters

_`(Array[string])`_

Defaults to `[ '{{{', '}}}' ]`. Used to set what triple delimiters to use when parsing templates.

```js
template: 'hello @html@',
tripleDelimiters: [ '@', '@' ],
data: { html: '<span>world</span>' }

// result:
hello <span>world</span>
```

---

## staticDelimiters

_`(Array[string])`_

Defaults to `[ '[[', ']]' ]`. Used to set what static (one-time binding) delimiters to use when parsing templates.

```js
var ractive = new Ractive({
  template: 'hello [[foo]]',
  staticDelimiters: [ '[[', ']]' ], //default
  data: { foo: 'world' }
});
// result: "hello world"

ractive.set( 'foo', 'mars' );
// still is: "hello world"
```

---

## staticTripleDelimiters

_`(Array<string>)`_

Defaults to `[ '[[[', ']]]' ]`. Used to set what static (one-time binding) triple delimiters to use when parsing templates.

```js
var ractive = new Ractive({
  template: 'hello [[[html]]]',
  staticTripleDelimiters: [ '[[[', ']]]' ], //default
  data: { html: '<span>world</span>' }
});
// result: "hello <span>world</span>"

ractive.set( 'html', '<span>mars</span>' );
// still is: "hello world"
```

---

## preserveWhitespace

_`(boolean)`_

Defaults to `false`. Whether or not to preserve whitespace in templates when parsing. (Whitespace in `<pre>` elements is always preserved.)

```js
var ractive = new Ractive({
  template: '<p>hello\n\n  \tworld   </p>',
  preserveWhitespace: false //default
});
console.log( ractive.toHTML() );
// "<p>hello world</p>"

var ractive = new Ractive({
  template: '<p>hello\n\n  \tworld   </p>',
  preserveWhitespace: true
});
console.log( ractive.toHTML() );
//"<p>hello
//
//  world   </p>"
```

Please note that the browser will still deal with whitespace in the normal fashion.

---

## stripComments

_`(boolean)`_

Defaults to `true`. Whether or not to remove comments in templates when parsing.

```js
template: '<!-- html comment -->hello world',
stripComments: false

// result:
<!-- html comment -->hello world
```

---

## sanitize

_`(boolean|Object)`_

Defaults to `false`. If `true`, certain elements will be stripped from templates at parse time - `<applet>`, `<base>`, `<basefont>`, `<body>`, `<frame>`, `<frameset>`, `<head>`, `<html>`, `<isindex>`, `<link>`, `<meta>`, `<noframes>`, `<noscript>`, `<Object>`, `<param>`, `<script>`, `<style>` and `<title>` - as will event attributes (e.g. `onclick`).

```js
template: '<p>some content</p><frame>Am I a bad element or just misunderstood?</frame>',
sanitize: true

// result:
<p>some content</p>
```

Alternatively, pass in an object with an `elements` property containing an array of blacklisted elements, and an optional `eventAttributes` boolean (`true` means 'disallow event attributes').

```js
template: '<p>some content</p><div onclick="doEvil()">the good stuff</div>',
sanitize: {
  elements: [ 'p' ],
  eventAttributes: true
}

// result:
<div>the good stuff</div>
```
