Ractive.js - Next-generation DOM manipulation
=============================================


*Got questions? Tag Stack Overflow questions with [ractivejs](http://stackoverflow.com/questions/tagged/ractivejs) or contact [@RactiveJS](http://twitter.com/RactiveJS) on Twitter*

What is Ractive.js?
-------------------

It's a JavaScript library for building reactive user interfaces in a way that doesn't force you into a particular framework's way of thinking. Its features include...

* data-binding, with a beautiful declarative syntax
* event handling that doesn't make you tear your hair out
* flexible and performant animations and transitions

...among many others. It takes a radically different approach to DOM manipulation - one that saves both you and the browser unnecessary work.

To get a feel for how it will make your life as a web developer easier, visit [ractivejs.org](http://ractivejs.org), follow the [interactive tutorials](http://learn.ractivejs.org), or try the [60 second setup](https://github.com/ractivejs/ractive/wiki/60-second-setup).


Get help
--------

If you don't find what you're looking for in the [docs](http://docs.ractivejs.org/latest), ask a question on in [Google Groups](https://groups.google.com/forum/#!forum/ractive-js) forum, Stack Overflow with the [`ractivejs`](http://stackoverflow.com/questions/tagged/ractivejs) tag, or send a tweet to [@RactiveJS](http://twitter.com/RactiveJS).


Building
--------

To build the project locally, you'll need to have [Grunt](http://gruntjs.com) installed. Clone the repo, navigate to the folder, then do

```shell
$ npm install
```

to install all the development dependencies (which aren't included in the repo itself). Then do

```shell
$ grunt
```

to build the project from source, lint it, run the tests and minify the library. If all of those steps succeed, files will be created in the `build` folder.

Other grunt commands available:

```shell
# Watch all source files, and rebuild when they change. This will
# only concatenate the files (it won't lint/test/minify) to the
# tmp folder
$ grunt watch

# Concatenate the files to the tmp folder
$ grunt concat

# Lint the concatenated code
$ grunt jshint

# Run tests on the concatenated code
$ grunt qunit

# Release a new version of the library to the release folder
# (reads version number from package.json)
$ grunt release
```


Contributing
------------

Pull requests and issues are always welcome! Please read [CONTRIBUTING.md](https://github.com/ractivejs/ractive/blob/master/CONTRIBUTING.md) to learn how to contribute.


Browser support
---------------

Tested successfully in IE8+ and all modern browsers. If your experience differs please let me know! (For legacy browser support, use the builds with `legacy` in the filename - these include polyfills for `Array.prototype.forEach` and other ES5 features used by Ractive.)


License
-------

Copyright (c) 2012-14 Rich Harris and contributors. Released under an [MIT license](https://github.com/ractivejs/ractive/blob/master/LICENSE.md).


[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/RactiveJS/ractive/trend.png)](https://bitdeli.com/free "Bitdeli Badge")
[![devDependency Status](https://david-dm.org/RactiveJS/Ractive/dev-status.png)](https://david-dm.org/RactiveJS/Ractive#info=devDependencies)
