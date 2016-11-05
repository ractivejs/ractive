---
title: Using Ractive with Browserify
---
[Browserify](http://browserify.org/) is a way of using [node-style](http://nodejs.org/) requires in the browser, bundling your scripts into a single file for efficient deployment.

There are three Browserify transforms available that you can use for Ractive.js:

- [Ractivate](https://www.npmjs.org/package/ractivate), a transform that will pre-parse templates. Contributed by [jrajav](https://github.com/jrajav). [(Github repository)](https://github.com/jrajav/ractivate)
- [Ractify](https://npmjs.org/package/ractify), a transform that will pre-compile components. Contributed by [marcello3d](https://github.com/marcello3d). [(Github repository)](https://github.com/marcello3d/node-ractify)
- [Ractiveify](https://npmjs.org/package/ractiveify), a transform that will pre-compile components with support for compiling embedded scripts and style tags (with Livescript, CoffeeScript, Sass, etc). Inspired by ractify. Contributed by [norcalli](https://github.com/norcalli). [(Github repository)](https://github.com/norcalli/ractiveify)

A [starter project](https://github.com/alienscience/gulp-ractive-starter) is available for using Ractivate with [gulp.js](http://gulpjs.com/) build system.

## Using plugins with Ractive and Browserify

{{{createLink 'Plugins'}}} typically include a Universal Module Definition (UMD) block that, in a node.js or Browserify environment, calls `require('ractive')`. If you want to be explicit about *which* version of Ractive gets loaded, you can do it when you configure browserify like so:

```js
browserify.require('./my-copy-of-ractive.js', { expose: 'ractive' });
```
