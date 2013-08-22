Ractive.js
==========

Next-generation DOM manipulation

tl;dr - See the [project homepage](http://ractivejs.org), [tutorials](http://learn.ractivejs.org) and [examples](http://ractivejs.org/examples), or try the [60 second setup](https://github.com/Rich-Harris/Ractive/wiki/60-second-setup).


It's templating Jim, but not as we know it
------------------------------------------

You've probably seen this kind of thing in JavaScript apps:

```js
template = '<p>Hello {{name}}!</p>';
data = { name: 'world' };
 
element.innerHTML = render( template, data ); // '<p>Hello world!</p>'
```

That's great, but what happens when `name` changes? Typically, you would have a view with a render method that re-created the HTML with the new data, then either updated `innerHTML`, or did the jQuery/Zepto/Ender equivalent.

In other words, we just threw away a perfectly good `p` element! Depending on the complexity of your template, that can mean a lot of work for the browser, as that element now has to be [garbage collected](https://developer.mozilla.org/en-US/docs/JavaScript/Memory_Management). Unless your user is in an older browser, in which case they may suffer memory leaks instead.

Of course, rather than doing the quick-at-first-but-wasteful-thereafter `innerHTML` thing, you might prefer manual DOM manipulation:

```html
<p>Hello <span id='name'></span>!</p>
```

```js
$('#name').text( currentName );
```

But that's no solution. You've added needless complexity to your DOM structure (bad for performance) and made your template more verbose and harder to reason about. And worst of all, you've swapped extra work for the browser with extra work for yourself.



Enter Ractive.js - surgical DOM manipulation
--------------------------------------------

There is a better way. Here's a basic Ractive.js setup:

```js
view = new Ractive({
  el: element,
  template: '<p>Hello {{name}}!</p>',
  data: { name: 'world' }
});
// renders <p>Hello world!</p> to our container element

view.set( 'name', 'Jim' );
// changes 'world' to 'Jim', leaves everything else untouched
```

When Ractive.js renders the template, it stores references to the bits that contain dynamic data &ndash; splitting up text nodes if necessary &ndash; and updates them when the data changes. It's quicker than `el.innerHTML` (or `$(el).html()`), and doesn't suffer from the many drawbacks of manual DOM manipulation.</p>



Yeah, yeah. Heard of Ember? Knockout?
-------------------------------------

You're right &ndash; we've already got perfectly good tools for keeping views in sync with their models. We've got frameworks like [Ember.js](http://emberjs.com) and [Angular.js](http://angularjs.org/), made by brilliant developers and used in successful apps. I'd certainly recommend trying them.

A lot of the time, though, you don't need the functionality of mega-frameworks, or the extra kilobytes (and learning curve) that go with them. And if you stray from the 'happy path' of anticipated use cases, be prepared to hack your way to a solution. Some developers become sceptical of the *magic* that goes on under the hood &ndash; if you can't understand it, you can't fix it when it goes wrong.

[Knockout.js](http://knockoutjs.com/) also deserves a special mention, for popularising the idea of *declarative data binding* in web apps, and doing so with a cracking library. Ractive.js is indebted to Knockout, from where it takes much inspiration.

But [mustache syntax](http://mustache.github.com/) is arguably much nicer to deal with, and your non-developer colleagues can easily understand it.

Ractive.js aims to combine **beautiful syntax** with a **simple API**, **miniscule footprint**, and **best-in-class performance**.



Neato features
--------------

Ractive.js complies with the [mustache spec](https://github.com/mustache/spec) as closely as possible. If you know mustache, you're good to go. (And if you don't, you can learn it in under 5 minutes.) That means:

* Nested properties of arbitrary depth: Hi there, `{{user.info.name.first}}`
* Update entire chunks of HTML with triples: `<div>{{{contents}}}</div>`
* Conditionals: `{{#gameover}}<p>Game over man, game over!</p>{{/gameover}}`
* Lists: `<ul>{{#users}}<li>{{name}} - {{company}}</li>{{/users}}</ul>`
* Custom delimiters, if you like to kick it `<%= old_school %>`
* Partials: `{{#basket}}<div>{{>item}}</div>{{/basket}}`
* Control over attributes: `<div style='color: {{prefs.color}};'></div>`

There's more!

* Precompilation: boost performance. Works on server or client.
* SVG support: create data-bound graphics
* Two-way data binding: respond to user input
* Extensibility: Use Ractive.extend to add your own logic
* AMD support: including a [RequireJS loader plugin](https://github.com/Rich-Harris/require-ractive-plugin)

Take a look at the [tutorials](http://learn.ractivejs.org/) to see how Ractive.js can make your life as a web developer easier, then read the [API docs](https://github.com/rich-harris/Ractive/wiki).



Caveats and feedback
--------------------

This project is in the early stages of development, though I've used it regularly in production code in my day job. YMMV! But if you end up using the library I'd love to hear from you – I'm [@rich_harris](http://twitter.com/rich_harris).

[Bug reports and issues](https://github.com/Rich-Harris/Ractive/issues) are very welcome, as are pull requests. If you run into problems, I'll do my best to help.



Browser support
---------------

Tested successfully in IE8+ and all modern browsers. If your experience differs please let me know!



License
-------

Released under the MIT license.
