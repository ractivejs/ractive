Ractive.js - Next-generation DOM manipulation
=============================================

What is Ractive.js?
-------------------

It's a JavaScript library for building reactive user interfaces in a way that doesn't force you into a particular framework's way of thinking. Its features include...

* data-binding, with a beautiful declarative syntax
* event handling that doesn't make you tear your hair out
* flexible and performant animations and transitions

...among many others. It takes a radically different approach to DOM manipulation - one that saves both you and the browser unnecessary work.

To get a feel for how it will make your life as a web developer easier, visit [ractivejs.org](http://ractivejs.org), follow the [interactive tutorials](http://learn.ractivejs.org), or try the [60 second setup](https://github.com/Rich-Harris/Ractive/wiki/60-second-setup).


Get help
--------

If you don't find what you're looking for in the [docs](https://github.com/rich-harris/Ractive/wiki), ask a question on Stack Overflow with the `ractive` tag, or send a tweet to [@RactiveJS](http://twitter.com/RactiveJS) or [@Rich_Harris](http://twitter.com/Rich_Harris).


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

If you have feature suggestions or bug reports, please [raise an issue on GitHub](https://github.com/Rich-Harris/Ractive/issues) after checking it's not a duplicate.

Pull requests are always welcome! In lieu of a formal styleguide, please try to follow the existing conventions.


Browser support
---------------

Tested successfully in IE8+ and all modern browsers. If your experience differs please let me know!


License
-------

Copyright (c) 2012-13 Rich Harris. Released under an MIT license.
