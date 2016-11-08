---
title: Event directives
---

DOM events are handled with template directives that take the form of element attributes, similar to global native DOM handlers, but are prefixed with `on-` plus the name of the event:

```html
<button on-click="activate">click me!</button>
```

You can assign multiple events by separating them with a hyphen:

```html
<div on-mouseover-mousemove='@this.set( "hover", true )'>...</div>
```
The structure of the attribute content will vary depending on whether you are using {{{createLink 'proxy events'}}} (the first example) or {{{createLink 'method calls'}}} (the second example). See each respective section for more details.

DOM events can be any supported event on the element node. Touch events - `touchstart`, `touchmove`, `touchend`, `touchcancel`, and `touchleave` (not w3c, but supported in some browsers) - can be used as well, and will be safely ignored if not supported by the current browser.

DOM Events will be automatically unsubscribed when the ractive instance is torndown.

### Cancelling DOM Events

See {{{createLink 'Publish-subscribe' 'publish-subscribe' 'cancelling-dom-events'}}} for information on automatically stopping DOM event propagation and default action.

## Custom events

In addition to all the usual DOM events, you can use *custom events* via {{{createLink 'Writing event plugins' 'event plugins'}}}. These allow you to define what conditions on the node should generate a directive-level event.

For example, you could add gesture support to your app with [ractive-touch](https://github.com/rstacruz/ractive-touch), which integrates [Hammer.js](http://hammerjs.github.io/) with Ractive.

Once defined, the custom event can then be used like any other event directive:

```html
<div on-swipeleft="nextPage">...</div>
```
Be aware that custom event names take precedence over native DOM event names.

## Component event directives

Template component elements can also have event directives:

```html
<my-widget on-foo="bar"/>
```

However, there are some differences and limitations to component event directives:

* These only respond to component raised events and are not DOM event or custom event subscriptions.
* Arguments to proxy events are ignored
* Method calls are not currently supported
* Pattern matching __is__ supported (see {{{createLink 'publish-subscribe' 'publish-subscribe' 'multiple-events-and-pattern-matching'}}}):
```html
<my-widget on-foo.*="bar"/>
```
