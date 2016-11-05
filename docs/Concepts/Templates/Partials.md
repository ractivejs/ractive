---
title: Partials
---

A partial is a template snippet which can be inserted into templates, or indeed other partials. They help to keep templates uncluttered and easy to read. In this example, we're creating a `\{{>thumbnail}}` partial:

```html
<!-- the main template -->
<div class='gallery'>
  \{{#items}}
    \{{>thumbnail}}
  \{{/items}}
</div>
```

```html
<!-- the partial -->
<figure class='thumbnail'>
  <img src='assets/thumbnails/\{{id}}.jpg'>
  <figcaption>\{{description}}</figcaption>
</figure>
```

* [Creating partials](#creation)
* [Partial expressions](#expressions)
* [Partial context](#context)
* [Recursive partials](#recursion)
* [Injecting partials](#injection)
* [Updating partials](#updating)

<a name="creation"></a>
## Creating partials

There are several ways to use partials.


### As an initialisation option

You can specify partials when you create a Ractive instance:

```js
ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  partials: { thumbnail: myThumbnailPartial },
  data: { items: myItems }
});
```

Here, `myThumbnailPartial` can be a {{{createLink 'templates' 'string template'}}}, a {{{createLink 'preparsing' 'parsed template'}}}, or a function that returns either of those.


### As a globally available partial

Equally, you can make partials globally available by adding them to {{{createLink 'ractive-partials-global' 'Ractive.partials'}}}:

```js
Ractive.partials.thumbnail = myThumbnailPartial;
```

Again, this can be a string template, parsed template, or a function that returns either of this - if a string, it will be parsed when it first gets used and stored as a parsed template thereafter.


### As a script tag

This method is particularly convenient if you don't want to load templates via AJAX:

```html
<script id='thumbnail' type='text/ractive'>
  <figure class='thumbnail'>
    <img src='assets/thumbnails/\{{id}}.jpg'>
    <figcaption>\{{description}}</figcaption>
  </figure>
</script>
```

The `type` attribute isn't important, as long as it exists and isn't `text/javascript`. All that matters is that it's a script tag whose `id` attribute matches the name of the partial. It's fairly common to see Ractive templates in script tags with `type="text/ractive"` to clearly indicate that they are meant to be handled by Ractive. It can be useful, though, to specify `type="text/html"` since many text editors support HTML templates in script tags for templating purposes.

Internally, when a template requests the `\{{>thumbnail}}` partial, Ractive will look for it on {{{createLink 'ractive-partials-instance' 'ractive.partials'}}}, then [Ractive.partials](ractive-partials-global), and if both of those fail it will then look for an element with an `id` of `thumbnail`. If it exists, it will parse its content and store it on {{{createLink 'ractive-partials-global' 'Ractive.partials'}}}, to make subsequent lookups quicker.



### Inline partials

It is also possible to embed partials within templates. Suppose you have a single `mainTemplate.html` file. You can define any partials within it by wrapping them in a special partial section:

```html
<div class='gallery'>
  \{{#items}}
    \{{>thumbnail}}
  \{{/items}}
</div>

\{{#partial thumbnail}}
  <figure class='thumbnail'>
    <img src='assets/thumbnails/\{{id}}.jpg'>
    <figcaption>\{{description}}</figcaption>
  </figure>
\{{/partial}}
```

In this case, the `thumbnail` partial won't be globally available - it will only be available to Ractive instances that use this template.

Prior to the introduction of the special partial section, inline partials were defined inside special HTML comments. The following is equivalent to the example above:

```html
<!-- \{{>thumbnail}} -->
<figure class='thumbnail'>
  <img src='assets/thumbnails/\{{id}}.jpg'>
  <figcaption>\{{description}}</figcaption>
</figure>
<!-- \{{/thumbnail}} -->
```

**Note** the comment-style of defining inline partials will be deprecated and removed in a future release.

If a partial is inlined within an element that isn't a component, it will be available to any partial references that are children of the element. This can be used to achieve a sort of template inheritance with partials and is pretty handy for layouts.

```html
\{{#partial header}}<h1 class="header">\{{>content}}</h1>\{{/partial}}
<section>
  \{{#partial content}}Partial "inheritance"!\{{/partial}}
  \{{>header}}
  Some content for the terribly contrived example here...
</section>
```

Result:
```html
<section>
  <h1 class="header">Partial "inheritance"!</h1>
  Some content for the terribly contrived example here...
</section>
```


<a name="expressions"></a>
## Partial expressions

Partial references may be a name that already exists as a partial, or they may also be any expression that resolves to a partial name. This can be used to select an appropriate partial based on the current context and more. The full power of Ractive's {{{createLink 'expressions'}}} are available. If the value of the expression changes, the partial fragment will be re-rendered using the new partial.

If a partial expression is a simple reference and a partial exists with the same name as the reference, the expression will not be evaluated. Instead, the partial with the same name as the reference will be used. For instance, if there are partials named `foo` and `bar`, a data member `foo: 'bar'`, and a partial section `\{{>foo}}`, the partial named `foo` will be used for the section because name-matching takes precedent over expression evaluation.

#### Example: Item specialization

```html
\{{#list}}\{{>.type}}\{{/}}

<!-- \{{>person}} -->
  \{{.name}} is a person. \{{.pronoun}} has \{{.fingerCount}} fingers.
<!-- \{{/person}} -->

<!-- \{{>animal}} -->
  \{{.name}} is a \{{.specie}}. \{{.pronoun}} has \{{.legCount}} legs.
<!-- \{{/animal}} -->
```

This example uses a combination of partial expressions and restricted references in the iteration of `list` to render a different template based on the `type` of item in the list. If there was an item `{ type: 'person', name: 'John', pronoun: 'He', fingerCount: 9 }` in the list, its output would be `John is a person. He has 9 fingers.`. `{ type: 'animal', name: 'Alfred', specie: 'starfish', pronoun: 'It', legCount: 5 }` would output `Alfred is a starfish. It has 5 legs.`.

#### Example: Partials on-the-fly

```html
<script id="template" type="text/ractive">
  Add a partial: <textarea value="\{{tpl}}" /><button on-click="@this.add()">Add</button><br/>
  \{{#list}}\{{>makePartial(.id, .template)}}\{{/}}
</script>
```
```js
new Ractive({
  template: '#template',
  el: 'main',
  data: {
    list: [],
    tpl: '',
    makePartial: function(id, template) {
      var key = 'partial-' + id;
      if (!!this.partials[key]) return key;
      this.partials[key] = template;
      return key;
    }
  },
  add: function() {
    this.push('list', { id: Math.random(), template: this.get('tpl') });
    this.set('tpl', '');
  }
});
```

This example uses a function to generate a partial on-the-fly and return the new generated partial name to be rendered. Note that if the `template` value for any of the items in `list` changes, its corresponding partial will **not** be updated in this instance. If you need to achieve something like that, you could modify the function to wrap the partial content in a conditional and modify the cacheing logic to re-render the target partial when its template changed.

### Invalid names

Partials may be named with the same rules as any other identifier in Ractive or JavaScript, but since there isn't much danger of trying to do math in a partial name, they enjoy relaxed naming requirements that allow otherwise reserved globals and keywords to be used for partial names. Partial names may also contain `-` characters as long as they are surrounded by other valid characters e.g. `some-partial-template`.

<a name="context"></a>
## Partial context

Partial sections may be given explicit context by adding an expression after the name in the form of `\{{>[name expression] [context expression]}}`. The partial will then be executed with the given context instead of the context in which the partial section appears. This has the same effect as wrapping the partial section in a `#with` section.

```html
\{{#list}}\{{>somePartial .foo.bar }}\{{/}}
```

In this example, `\{{this}}` of `\{{.}}` in `somePartial` will resolve to the `.foo.bar` path of the current item in `list`. Ancestor references, members, object literals, and any other expressions that resolve to an object may be used as a context expression. Aliases may also be established for use in a partial e.g. `\{{>somePartial .foo.bar as item, 42 as magicNumber}}`, and in the case of `item`, as a plain referece, can still be used for two-way binding.


<a name="recursion"></a>
## Recursive partials

Partials can be used *recursively*:

```html
<div class='fileSystem'>
  \{{#root}}
    \{{>folder}}
  \{{/root}}
</div>

\{{#partial folder}}
<ul class='folder'>
  \{{#files}}
    \{{>file}}
  \{{/files}}
</ul>
\{{/partial}}

\{{#partial file}}
<li class='file'>
  <img class='icon-\{{type}}'>
  <span>\{{filename}}</span>

  <!-- if this is actually a folder, embed the folder partial -->
  \{{# type === 'folder' }}
    \{{>folder}}
  \{{/ type === 'folder' }}
</li>
\{{/partial}}
```

```js
rv = new Ractive({
  el: 'container',
  template: '#myTemplate',
  data: {
    root: {
      files: [
        { type: 'jpg', filename: 'hello.jpg' },
        { type: 'mp3', filename: 'NeverGonna.mp3' },
        { type: 'folder', filename: 'subfolder', files: [
          { type: 'txt', filename: 'README.txt' },
          { type: 'folder', filename: 'rabbithole', files: [
            { type: 'txt', filename: 'Inception.txt' }
          ]}
        ]}
      ]
    }
  }
});
```

In the example above, subfolders use the `\{{>folder}}` partial, which uses the `\{{>file}}` partial for each file, and if any of those files are folders, the `\{{>folder}}` partial will be invoked again, and so on until there are no more files.

Beware of cyclical data structures! Ractive makes no attempt to detect cyclicality, and will happily continue rendering partials until the [Big Crunch](http://en.wikipedia.org/wiki/Big_Crunch) (or your browser exceeds its maximum call stack size. Whichever is sooner).


<a name="injection"></a>
## Injecting partials

One good use of partials is to vary the shape of a template according to some condition, the same way you might use [dependency injection](http://en.wikipedia.org/wiki/Dependency_injection) elsewhere in your code.

For example, you might offer a different view to mobile users:

```html
<div class='main'>
  <div class='content'>
    \{{>content}}
  </div>

  <div class='sidebar'>
    \{{>sidebar}}
  </div>
</div>
```

```js
isMobile = /mobile/i.test( navigator.userAgent ); // please don't do this in real life!

ractive = new Ractive({
  el: myContainer,
  template: myTemplate,
  partials: {
    content: isMobile ? mobileContentPartial : desktopContentPartial,
    sidebar: isMobile ? mobileSidebarPartial : desktopSidebarPartial
  }
});
```

Or you might make it possible to {{{createLink 'ractive-extend' 'extend'}}} a subclass without overriding its template:

```html
<div class='modal-background'>
  <div class='modal'>
    \{{>modalContent}}
  </div>
</div>
```

```js
// Create a Modal subclass
Modal = Ractive.extend({
  template: modalTemplate,
  init: function () {
    var self = this, resizeHandler;

    resizeHandler = function () {
      self.center();
    };

    // when the window resizes, keep the modal horizontally and vertically centred
    window.addEventListener( 'resize', resizeHandler );

    // clean up after ourselves later
    this.on( 'teardown', function () {
      window.removeEventListener( 'resize', resizeHandler );
    });

    // manually call this.center() the first time
    this.center();
  },
  center: function () {
    // centering logic goes here
  }
});

helloModal = new Modal({
  el: document.body,
  partials: {
    modalContent: '<p>Hello!</p><a class="modal-button" proxy-tap="close">Close</a>'
  }
});

helloModal.on( 'close', function () {
  this.teardown();
});
```


<a name="updating"></a>
## Updating Partials

Partials may be reset after they are rendered using `resetPartial` as documented {{{ createLink 'ractive.resetPartial()' 'here' }}}. A reset partial will update everywhere it is referenced, so if it is used multiple times or inherited by a component, those instances will be updated as well. If a component has a partial with the same name as a parent partial, partial resets will not affect it since it is a different partial.

It should be noted that partials evaluate lazily, so it is possible to cause a single partial to update by wrapping it in a conditional section and causing the section to be hidden and re-shown.

```html
\{{^toggle}}\{{>rickroll}}\{{/}}
```

```js
ractive.partials.rickroll = 'I wouldn\'t do that to you, chum.';
ractive.set('toggle', true);
ractive.set('toggle', false);
```
