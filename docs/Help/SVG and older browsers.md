---
title: SVG and Older Browsers
---
Ractive doesn't mind whether you're rendering HTML or SVG - it treats both the same way. Unfortunately, some browsers (notably IE8 and below, and Android 2.3 and below) *do* care.

If your template includes SVG, these browsers will throw an error along the following lines:

```
"This browser does not support namespaces other than http://www.w3.org/1999/xhtml. The most likely cause of this error is that you're trying to render SVG in an older browser. See https://github.com/RactiveJS/Ractive/wiki/SVG-and-older-browsers for more information"
```

Unfortunately, [the only winning move is not to play](http://xkcd.com/601/). In other words, you will need to explicitly choose not to try and render SVG.

For example, you might do something along these lines:

```js
// detect SVG support (thanks, http://stackoverflow.com/a/706590)
hasSvgSupport = document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#BasicStructure', '1.1');

// note - as of Ractive 0.3.9, you can do this instead:
hasSvgSupport = Ractive.svg;

if ( hasSvgSupport ) {
  template = awesomeVectorGraphics;
} else {
  template = rubbishFallbackContent;
}

ractive = new Ractive({
  el: 'container',
  template: template
});
```