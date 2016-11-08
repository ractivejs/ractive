---
title: Event Bubbling
---

Events that fire in components will bubble up the view hierarchy - [see this demonstration](http://jsfiddle.net/rich_harris/cdvehp1t/). Bubbling events are namespaced by the element name used for that component in the template:

```js
ractive = new Ractive({
    el: document.body,
    template: '<widget/>',
    components: {
        widget: Ractive.extend({
            template: '<button on-click="select">Select Me</button>'
        })
    },
    oninit: function () {
	    this.on( 'widget.select', function () {
	    	alert('selected!');
		});
	}
});
```
The event will continue to bubble up under the name of the originating component, not the name of each parent component.

## Cancelling

Returning `false` from an event handler will prevent that event from bubbling further:

```js
this.on( 'widget.select', function () {
    return false;
});

```

Sibling event handlers will still be called. Cancelling only applies to bubbling up to the next level of the view hierarchy.

Note that returning `false` has a dual purpose of both cancelling the view hierarchy event bubbling __and__ cancelling the DOM Event if the event was DOM-based.

Template directives for handling component events _implicitly_ cancel bubbling of the subscribed event:

```html
<widget on-foo='bar'/>
```
In this example, `widget.foo` will not bubble. Instead a new event `bar` will be fired and bubbled, assuming the above template is also contained in a component, under the name of the new component.

## The `event.component` Property

Events that bubble add a `component` property to the event object that is the component ractive instance raising the event:

```js
this.on( 'widget.select', function ( event ) {
    event.component.observe( 'foo', function ( n, o, k ) {
        console.log( 'foo changed from', o, 'to', n );
    });
});

```
