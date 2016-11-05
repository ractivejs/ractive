---
title: Writing transition plugins
---

## Creating transitions

We're going to create a `flash` transition, that flashes text green on intro, and red on outro. To skip ahead and see the result, [open the JSFiddle](http://jsfiddle.net/rich_harris/Hf2ea/).

All we need to do is create a function that receives a transition object, `t`. This function is called when a new element is added to the DOM (if it has an `intro="flash"` directive), and when that element is removed from the DOM.

Because transitions are generally asynchronous, we have to call `t.complete()` once they have finished.

```js
var flashTransition = function ( t ) {
	if ( t.isIntro ) {
		// we're entering the DOM
	} else {
		// we're leaving the DOM
	}

	doSomeAsynchronousWork().then( t.complete );
};
```

## The transition object (`t`)

The `t` object has a few properties and methods designed to make creating transitions easier.

> ### t.node
> The node that's entering or leaving the DOM

> ### t.isIntro
> Should be self-explanatory...

> ### t.name
> The name of the transition (in our example, 'flash')

> ### t.params
> Transition parameters (see below). You won't normally need this, as they are supplied as arguments to the function.

> ### t.complete([ noReset ])
> You must call this within your transition function, otherwise Ractive has no idea whether a transition has finished or not
> > #### noReset *`Boolean`*
> > Defaults to `false`. Generally, you won't need this. If `true`, `t.resetStyle()` (see below) is not called, even if this is an intro transition.

> ### t.getStyle( prop )
> A convenient way to get a particular style property for `t.node`. It uses `window.getComputedStyle()` (the {{{createLink 'legacy builds'}}} include a shim for old IE). Prefixes are applied automatically, so do `t.getStyle('transform')`, not `t.getStyle('-webkit-transform')` or whatever. You can use either camelcased or hyphenated styles ('backgroundColor' or 'background-color').
> > #### **prop** *`String`*
> > The style property to get the value of, e.g. `'opacity'`

> ### t.getStyle( props )
> As above, but several properties simultaneously. Returns an `Object` containing a map of properties to values.
> > #### **props** *`Array`*
> > A list of properties to get, e.g. `['width', 'height']`.


> ### t.setStyle( prop, value )
> Sets a style on `t.node`. Again, you don't need to worry about prefixes, and you can use camelcased or hyphenated property names.
> > #### **prop** *`String`*
> > The style property to set, e.g. `'color'`
> > #### **value**
> > The value to set it to, e.g. `'red'`

> ### t.setStyle( props )
> Sets several styles simultaneously.
> > #### **props** *`Object`*
> > A map of properties to values, e.g. `{opacity: 0, transform: 'scale(0)'}`

> ### t.animateStyle( prop, value, options[, complete ])
> Animates a style property, using CSS transitions.
> > #### **prop** *`String`*
> > The style to animate.
> > #### **value**
> > The value to animate it to.
> > #### **options** *`Object`*
> > > #### **duration** *`Number`*
> > > The duration of the animation, in milliseconds
> > > #### easing *`String`*
> > > Defaults to `'linear'`. Any [valid CSS timing function](http://cubic-bezier.com/#.17,.67,.83,.67), e.g. `ease-in-out`, or `cubic-bezier(.17,.67,.83,.67)`
> > > #### delay *`Number`*
> > > The number of milliseconds to wait before beginning the animation

> > #### complete *`Function`*
> > A callback function that will be called when the animation is complete (or immediately, if there are no changes)


> ### t.animateStyle( props, options[, complete ])
> > #### **props** *`Object`*
> > A map of properties to values.
> > #### **options** *`Object`*
> > As above.

> > #### complete *`Function`*
> > As above.

> ### t.resetStyle()
> Resets the style of an element to how it was when you found it. Generally you won't need to use this directly, as it is called by `t.complete()` if the transition is an intro, unless you do `t.complete(true)`.

> ### t.processParams( params[, defaults ])
> Interprets a parameters object or value according to the guidelines in the next section.
> > #### params *`Object` or `Number` or `String`*
> > An object with parameters, or either a) a number, which will be treated as a duration in milliseconds, or b) one of `'fast'` or `'slow'`, which indicate a duration of 200 or 600 milliseconds respectively.
> > #### defaults *`Object`*
> > The default options for the transition. Any options on this object that are not specified in the directive will be added to the return value.


## Parameters

Users of your transition can pass parameters like so:

```html
<p intro='flash:{duration:{{transitionDuration}},color:"blue"}'>
	this text will flash blue on intro
</p>
```

In this case, the transition function's second argument will be an object with a `duration` property, whose value is whatever `transitionDuration` is at the time the transition happens, and a `color` property whose value is `"blue"`.

By convention, if a user passes a single numeric argument, or the string 'fast' or 'slow', it should be treated as a duration. You can use `t.processParams(params)` to do this.

```html
<p intro='flash:500'>this text will flash green (default colour) for 500 milliseconds</p>
<p intro='flash:fast'>this text will flash for 200 milliseconds</p>
<p intro='flash:slow'>this text will flash for 600 milliseconds</p>
```

## Our example flash transition

You can see the finished product at [this JSFiddle](http://jsfiddle.net/rich_harris/Hf2ea/).

```js
flashTransition = function ( t, params ) {
	var color, duration;

	// Process parameters (second argument provides defaults)
	params = t.processParams( params, {
		duration: 400,
		color: t.isIntro ? 'rgb(0,255,0)' : 'rgb(255,0,0)'
	});

	// Then, we execute the transition itself
	t.setStyle( 'color', params.color );

	// After the specified duration, call `t.complete()` to
	// signal that we've finished
	setTimeout( t.complete, params.duration );
};
```

## Registering transitions

Now that we've made a transition, we need to make it available to Ractive. As with other plugins, we have a few options, depending on what we plan to do:

```js
// transition is available to all Ractive instances
Ractive.transitions.flash = flashTransition;

// transition is available to a single Ractive instance:
ractive = new Ractive({
	el: 'body',
	template: template,
	transitions: {
		flash: flashTransition
	}
});

// decorator is available to all instances of e.g. RactiveWithTransition:
RactiveWithTransition = Ractive.extend({
	transitions: {
		flash: flashTransition
	}
});
```

## Sharing your transitions

If you create a transition that you find useful, other developers probably will too. Share it! An easy way to get started is to use the [plugin template](https://github.com/RactiveJS/Plugin-template), which uses [Grunt](htp://gruntjs.com) and walks you through the steps necessary to create a plugin with a demo page.

Once you're ready to share it with the world, ping [@RactiveJS](http://twitter.com/RactiveJS) on Twitter. Thanks!
