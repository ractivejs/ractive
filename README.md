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

If you don't find what you're looking for in the [docs](http://docs.ractivejs.org/latest), ask a question in [Google Groups](https://groups.google.com/forum/#!forum/ractive-js) forum, Stack Overflow with the [`ractivejs`](http://stackoverflow.com/questions/tagged/ractivejs) tag, or send a tweet to [@RactiveJS](http://twitter.com/RactiveJS).


Developing and building
-----------------------

If you want to hack on Ractive, the first step is to clone the repo and install all its development dependencies:

```bash
git clone https://github.com/ractivejs/ractive   # or your fork
cd ractive
npm install
```

While developing the library, you can serve it with [gobble](https://github.com/gobblejs/gobble):

```bash
npm run serve
```

Navigate to [localhost:4567](http://localhost:4567) - you'll see two folders, plus `ractive.js`:

* `sandbox` - this contains some template files to help with debugging. Start by copying the `sandbox/sample` folder and following the instructions therein
* `test` - the test suite (duh)

After the initial build, any subsequent changes will result in fast incremental rebuilds. If you're using Chrome, you can use the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) plugin.

*Gobble is still in development - please report any bugs to the [issue tracker](https://github.com/gobblejs/gobble/issues) - thanks!*

To run a complete build (including linting, testing and minification):

```bash
npm run build
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
