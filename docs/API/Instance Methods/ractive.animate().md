---
title: ractive.animate()
---

Similar to {{{createLink 'ractive.set()'}}}, this will update the data and re-render any affected mustaches (and notify {{{createLink 'observers'}}}).

All animations are handled by a global timer that is shared between Ractive instances (and which only runs if there are one or more animations still in progress), so you can trigger as many separate animations as you like without worrying about timer congestion. Where possible, `requestAnimationFrame` is used rather than `setTimeout`.

Numeric values and strings that can be parsed as numeric values can be interpolated. Objects and arrays containing numeric values (or other objects and arrays which themselves contain numeric values, and so on recursively) are also interpolated.

<aside>
    <div class='aside-inner'>
        <p>Note that there is currently no mechanism for detecting cyclical structures! Animating to a value that indirectly references itself will cause an infinite loop.</p>

        <p>Future versions of Ractive may include string interpolators - e.g. for SVG paths, colours, transformations and so on, a la D3 - and the ability to pass in your own interpolator.</p>
    </div>
</aside>

If an animation is started on a keypath which is *already* being animated, the first animation is cancelled. (Currently, there is no mechanism in place to prevent collisions between e.g. `ractive.animate('foo', { bar: 1 })` and `ractive.animate('foo.bar', 0)`.)


> ### ractive.animate( keypath, value[, options] )
> Returns a `Promise` (see {{{createLink 'Promises'}}}) with an additional `stop` method, which cancels the animation.

> > #### **keypath** *`String`*
> > The {{{createLink 'keypaths' 'keypath'}}} to animate.

> > #### **value** *`Number` or `String` or `Object` or `Array`*
> > The value to animate to.

> > #### options *`Object`*
> > Settings for the animation. All properties are optional:
> > > #### duration *`Number`*
> > > Defaults to 400. How many milliseconds the animation should run for
> > > #### easing *`String` or `Function`*
> > > Defaults to `'linear'`. The name of an easing function on {{{createLink 'Ractive.easing'}}}, or the easing function itself
> > > #### step *`Function`*
> > > A function to be called on each step of the animation. Receives `t` and `value` as arguments, where `t` is the animation progress (between 0 and 1, as determined by the easing function) and `value` is the intermediate value at `t`
> > > #### complete *`Function`*
> > > A function to be called when the animation completes, with the same argument signature as `step` (i.e. `t` is `1`, and `value` is the destination value)


> ### ractive.animate( map[, options] )
> Returns a `Promise` (see {{{createLink 'Promises'}}}) with an additional `stop` method, which cancels the animations.

> > #### **map** *`Object`*
> > A map of `keypath: value` pairs
> > #### options *`Object`*
> > As above.
