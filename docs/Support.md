# Getting in touch

There are a lot of places to find help if you get stuck with Ractive:

* [StackOverflow](http://stackoverflow.com/questions/tagged/ractivejs)
* [Google Groups](http://groups.google.com/forum/#!forum/ractive-js)
* [GitHub](https://github.com/ractivejs/ractive/issues)
* [Twitter](http://twitter.com/RactiveJS)

# Legacy Browser Support

In a perfect world, every copy of Internet Explorer below version 11 would be living out its days in a pleasant retirement home, playing bingo and fighting over the remote control with Lotus Notes, and the IE dev team would adopt a modern release cycle so that newer versions weren't constantly playing catch-up with the browsers built on open source.

Sadly that's not the case, and it's not just IE that's the problem - there are plenty of IT departments out there who think it's perfectly fine to lock their users to a version of Firefox that should have collected its bus pass a long time ago.

Fortunately, Ractive still caters for these browsers, but you need to use a legacy build. The legacy builds, which have obvious names like `ractive-legacy.js`, include various shims and polyfills that allow the grumpy old browsers to play with the kids - things like `Array.prototype.indexOf`, `addEventListener`, and so on. Newer browsers will simply ignore them, so you can use the legacy builds without any penalty other than the slightly larger file size.

# SVGs and older browsers

Ractive doesn't mind whether you're rendering HTML or SVG - it treats both the same way. Unfortunately, some browsers (notably IE8 and below, and Android 2.3 and below) *do* care.

If your template includes SVG, these browsers will throw an error along the following lines:

```
"This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you're trying to render SVG in an older browser. See https://github.com/RactiveJS/Ractive/wiki/SVG-and-older-browsers for more information"
```

Unfortunately, [the only winning move is not to play](http://xkcd.com/601/). In other words, you will need to explicitly choose not to try and render SVG.

For example, you might do something along these lines:

```js
// Detect SVG support (thanks, http://stackoverflow.com/a/706590)
const hasSvgSupport = document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');

// As of Ractive 0.3.9, you can do this instead:
const hasSvgSupport = Ractive.svg;

new Ractive({
  el: 'container',
  template: hasSvgSupport ? awesomeVectorGraphics : rubbishFallbackContent;
});
```
