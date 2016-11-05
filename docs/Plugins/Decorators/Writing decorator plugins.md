---
title: Writing decorator plugins
---

A {{{createLink 'decorators' 'decorator'}}} is a way to add behaviour to a node when it is rendered, or to augment it in some way.

For this example we'll create a tooltip decorator. For the impatient, you can see the [finished result in this JSFiddle](http://jsfiddle.net/tomByrer/9g3pB/11/).

Firstly, we need to add the `decorator` *directive* to any nodes that the decorator should apply to:

```html
<p>This text contains <span decorator='tooltip:This is a tooltip'>tooltips</span>.</p>
```

(Directives are just instructions to Ractive - they don't actually get added to the element as attributes.)

Now, the `tooltip` decorator function will be called when the `<span>` is added to the DOM. The first argument to the function is the `<span>` itself; subsequent arguments given after the `:` in the directive will be passed to the function - in this case, there will be a second argument, which is the 'This is a tooltip' message.

Within that function, we can do whatever we like - the only rule is that it must return an object with a `teardown()` method that gets called if the `<span>` is removed from the DOM:

```js
var tooltipDecorator = function ( node, content ) {
  // setup work goes here...

  return {
    teardown: function () {
      // ...any cleanup work goes here
    }
  };
};
```

There are a couple of ways to make the decorator available to Ractive:

```js
// decorator is available to all Ractive instances
Ractive.decorators.tooltip = tooltipDecorator;

// decorator is available to a single Ractive instance:
ractive = new Ractive({
  el: 'body',
  template: template,
  decorators: {
    tooltip: tooltipDecorator
  }
});

// decorator is available to all instances of e.g. RactiveWithTooltip:
RactiveWithTooltip = Ractive.extend({
  decorators: {
    tooltip: tooltipDecorator
  }
});
```


## Adding the logic

So far, we've got a decorator that doesn't actually do anything. Let's fix that.

```js
var tooltipDecorator = function ( node, content ) {
  var tooltip, handlers, eventName;

  // Create some event handlers. NB we can use addEventListener
  // with impunity, even in old IE, by using a legacy build:
  // https://docs.ractivejs.org/latest/Legacy-builds
  handlers = {
    mouseover: function () {
      // Create a tooltip...
      tooltip = document.createElement( 'p' );
      tooltip.className = 'ractive-tooltip';
      tooltip.textContent = content;

      // ...and insert it before the node
      node.parentNode.insertBefore( tooltip, node );
    },

    mousemove: function ( event ) {
      // Keep the tooltip near where the mouse is
      tooltip.style.left = event.clientX + 'px';
      tooltip.style.top = ( event.clientY - tooltip.clientHeight - 20 ) + 'px';
    },

    mouseleave: function () {
      // Destroy the tooltip when the mouse leaves the node
      tooltip.parentNode.removeChild( tooltip );
    }
  };

  // Add event handlers to the node
  for ( eventName in handlers ) {
    if ( handlers.hasOwnProperty( eventName ) ) {
      node.addEventListener( eventName, handlers[ eventName ], false );
    }
  }

  // Return an object with a `teardown()` method that removes the
  // event handlers when we no longer need them
  return {
    teardown: function () {
      for ( eventName in handlers ) {
        if ( handlers.hasOwnProperty( eventName ) ) {
          node.removeEventListener( eventName, handlers[ eventName ], false );
        }
      }
    }
  };
};
```

We'll need to add some CSS to complete the effect:

```css
.ractive-tooltip {
  display: block;
  position: fixed;
  max-width: 300px;
  background-color: #f4f4f4;
  border: 1px solid #eee;
  box-shadow: 1px 1px 3px rgba(0,0,0,0.1);
  padding: 0.5em;
  font-size: 0.8em;
}
```


## Adding parameters

But wait - what if we don't want to use the `ractive-tooltip` class name? In fact, come to mention it, there's a whole load of hard-coded assumptions in there.

There are two ways we could address this. Firstly, we could add a whole load of additional arguments to the decorator directive:

```html
<span decorator='tooltip:"This is a tooltip","p","tooltips-ftw",0,-20'>tooltips</span>
```

```js
tooltipDecorator = function ( node, content, elementName, className, offsetX, offsetY ) {
  /* ... */
};
```

That gives you lots of flexibility but it's pretty verbose.

Luckily there's another way. Because, in JavaScript, functions are also objects, we can add properties to the decorator function itself, like so:

```js
tooltipDecorator = function ( node, content ) {
  /*
    Instead of...

      tooltip = document.createElement( 'p' );
      tooltip.className = 'ractive-tooltip';

    ...we do

      tooltip = document.createElement( tooltipDecorator.elementName );
      tooltip.className = tooltipDecorator.className;
  */
};

// Default parameters
tooltipDecorator.elementName = 'p';
tooltipDecorator.className = 'ractive-tooltip';
tooltipDecorator.offsetX = 0;
tooltipDecorator.offsetX = -20;

Ractive.decorators.tooltip = tooltipDecorator;

// Later, a developer using the tooltip decorator can customise it, e.g.
Ractive.decorators.tooltip.className = 'tooltips-ftw';
```

You can use a tooltip like this in your app with the [ractive-tooltip](http://github.com/JonDum/ractive-tooltip) package available on NPM.
Install it via `npm install ractive-tooltip --save` and use it in your app with
```js
ractive = new Ractive({
    ...
    decorators: {
        tooltip: require('ractive-tooltip')
    },
    ...
});
```


## Sharing your decorators

If you create a decorator that you find useful, other developers probably will too. Share it! An easy way to get started is to use the [plugin template](https://github.com/RactiveJS/Plugin-template), which uses [Grunt](http://gruntjs.com) and walks you through the steps necessary to create a plugin with a demo page.

Once you're ready to share it with the world, ping [@RactiveJS](http://twitter.com/RactiveJS) on Twitter. Thanks!
