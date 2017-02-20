---
title: 'Method calls'
---

*See also: {{{createLink 'proxy events'}}}*

__Note:__ Unqualified event method calls are deprecated and have been replaced with event expressions that resolve the same way as every other expression in a Ractive template. This means that to call, for instance, `set('foo', 'bar')` in an event, you would now use `@this.set('foo', 'bar')`. Unfortunately, this adds a bit of boilerplate to common method calls, but it is also resolves the disparity between event directives and other template references, allows calling data methods from events, and allows executing multiple, possibly more complex, expressions when an event fires.

As an alternative to {{{createLink 'proxy events'}}}, you can execute any expression(s) supported by Ractive in response to an {{{createLink 'event directives' 'event directive'}}}, right from your template:

```html
<p>foo is \{{foo}}</p>
<button on-click='@this.toggle("foo")'>toggle foo</button>
```

In this case, because {{{createLink 'ractive.toggle()'}}} is a built-in method, clicking the button will toggle the value of `foo` between `true` and `false` ([demo](http://jsfiddle.net/rich_harris/xxg93vw8/)).

This also works with custom methods:

```js
var ractive = new Ractive({
  el: 'body',
  template: '<button on-click="@this.klaxon()">sound the klaxon</button>',
  audio: new Audio( 'klaxon.mp3' ),
  klaxon: function () {
    this.audio.play();
  }
});
```

You can pass as many arguments to the method as you like, including data references:

```html
\{{#each items :i}}
  <button on-click='@this.select(this,i)'>select this item</button>
\{{/each}}
```

Notice that mustaches are __not__ used with data reference in method calls, i.e. `\{{i}}` and will cause errors if they are. String literals need to be in quotes:

```html
<button on-click='@this.set("foo", true)'>make foo true</button>
```

You can also pass the `event` object, or properties thereof (`event.original` is the original DOM event) ([demo](http://jsfiddle.net/rich_harris/9ecvjjtm/)):

```html
<div
  on-mousemove='@this.set({
    x: event.original.clientX,
    y: event.original.clientY
  })'
  on-mouseleave='@this.set({
    x: "unknown",
    y: "unknown"
  })'
>
  <p>current mouse position: \{{x}} x \{{y}}</p>
</div>
```

The `event` object is also available within body of the method call function as `this.event`. Note that methods on your Ractive instance that may handle your events are effectively part of your public API, and `this.event` will only be available during invocations triggered by an event.

The `event` argument is also extended with contextual helper methods. See {{{createLink 'Ractive.getNodeInfo()' 'helpers' 'helpers'}}}.

If you need to evaluate multiple expressions from an event directive, simply separate them with a `,`. For instance:

```html
\{{#each someList as item}}
<div>
  \{{item.display}}
  <a href="#" on-click="event.pop('../'), @this.notifyUser('item removed!'), false">
    Remove and Notify
  </a>
</div>
\{{/each}}
```

Note that this is a list of independent expressions, and as long as one doesn't throw, they will all be evaluated.

### Cancelling events

As with proxy events, you can cancel a DOM event by returning `false` from your event handler. Ractive with then call `preventDefault()` and `stopPropagation()` on the original DOM event. You can also call any methods on the original event by having it passed to your handler or accessing it using `this.event.original`. With event expressions, you can force the cancellation regardless of the return from any methods you call by simply including `false` as the last expression in your list, as above in the 'Remove and Notify' example. You can also override cancellation in much the same way by using `true` instead of `false`.
