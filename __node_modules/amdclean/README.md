#amdclean

A build tool that converts AMD code to standard JavaScript.

[![Build Status](https://travis-ci.org/gfranko/amdclean.png?branch=master)](https://travis-ci.org/gfranko/amdclean)
[![NPM version](https://badge.fury.io/js/amdclean.png)](http://badge.fury.io/js/amdclean)

`npm install amdclean --save-dev`

[Getting Started Video](http://www.youtube.com/watch?v=wbEloOLU3wM)


## Use Case

**Single file** client-side JavaScript libraries or web apps that want to use AMD to structure and build their code, but don't want an AMD footprint.


## Used By

* [Backbone-Require-Boilerplate](https://github.com/BoilerplateMVC/Backbone-Require-Boilerplate) - A Rad Backbone.js and Require.js Boilerplate Project

* [Ractive.js](http://www.ractivejs.org/) - Next-generation DOM manipulation

* [AddThis Smart Layers](https://www.addthis.com/get/smart-layers) - Third-party social widgets suite

* [Mod.js](http://madscript.com/modjs/) - JavaScript Workflow Tooling 


## Why

Many developers like to use the AMD API to write modular JavaScript, but do not want to include a full AMD loader (e.g. [require.js](https://github.com/jrburke/requirejs)), or AMD shim (e.g. [almond.js](https://github.com/jrburke/almond)) because of file size/source code readability concerns.

By incorporating amdclean.js into the build process, there is no need for Require or Almond.

Since AMDclean rewrites your source code into standard JavaScript, it is a great
fit for JavaScript library/web app authors who want a tiny download in one file after using the
[RequireJS Optimizer](http://requirejs.org/docs/optimization.html).


## Restrictions

**Note:** Same restrictions as almond.js.

It is best used for libraries or apps that use AMD and optimize all the modules into one file -- no dynamic code loading.


##What is Supported

* `define()` and `require()` calls.

* [Shimmed modules](http://requirejs.org/docs/api.html#config-shim)

* [Simplified CJS wrapper](https://github.com/jrburke/requirejs/wiki/Differences-between-the-simplified-CommonJS-wrapper-and-standard-AMD-define#wiki-cjs) (requires the `globalObject` option to be set to `true`)

* Exporting global modules to the global `window` object

* Storing all local modules inside of a single global object (Helps scoping issues for certain use cases)

## Download

Node - `npm install amdclean --save-dev`

Web - [Latest release](https://github.com/gfranko/amdclean/blob/master/src/amdclean.js)


## Usage

There are a few different ways that amdclean can be used including:

* With the RequireJS Optimizer (plain node, Grunt, Gulp, etc)

* As a standalone node module

* As a client-side library


###RequireJS Optimizer

* [Download the RequireJS optimizer](http://requirejs.org/docs/download.html#rjs).

* `npm install amdclean --save-dev`

* Make sure that each of your AMD modules have a module ID `path` alias name (this is not required, but a good idea)

```javascript
paths: {

  'first': '../modules/firstModule',

  'second': '../modules/secondModule',

  'third': '../modules/thirdModule'

}
```

* Add an `onModuleBundleComplete` config property to your RequireJS build configuration file instead.  Like this:

```javascript
onModuleBundleComplete: function (data) {
  var fs = module.require('fs'),
    amdclean = module.require('amdclean'),
    outputFile = data.path;
  fs.writeFileSync(outputFile, amdclean.clean({
    'filePath': outputFile
  }));
}
```

* Run the optimizer using [Node](http://nodejs.org) (also [works in Java](https://github.com/jrburke/r.js/blob/master/README.md)).  More details can be found in the the [r.js](https://github.com/jrburke/r.js/) repo.

* If you are using the RequireJS optimizer [Grunt task](https://github.com/gruntjs/grunt-contrib-requirejs), then it is very easy to integrate amdclean using either the `onBuildWrite` or the `onModuleBundleComplete` config options. Here is an example Grunt file that includes the RequireJS optimizer plugin with amdclean support:

```javascript
module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    requirejs: {
      js: {
        options: {
          findNestedDependencies: true,
          baseUrl: 'src/js/app/modules',
          wrap: true,
          preserveLicenseComments: false,
          optimize: 'none',
          mainConfigFile: 'src/js/app/config/config.js',
          include: ['first'],
          out: 'src/js/app/exampleLib.js',
          onModuleBundleComplete: function (data) {
            var fs = require('fs'),
              amdclean = require('amdclean'),
              outputFile = data.path;
            fs.writeFileSync(outputFile, amdclean.clean({
              'filePath': outputFile
            }));
          }
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.registerTask('build', ['requirejs:js']);
  grunt.registerTask('default', ['build']);
};
```

###Node Module

* `npm install amdclean --save-dev`

* Require the module

```javascript
var amdclean = require('amdclean');
```

* Call the clean method

```javascript
var code = 'define("exampleModule", function() {});'
var cleanedCode = amdclean.clean(code);
```


###Client-side Library

* Include all dependencies

```html
<script src="http://esprima.org/esprima.js"></script>
<script src="http://constellation.github.io/escodegen/escodegen.browser.js"></script>
<script src="https://rawgithub.com/Constellation/estraverse/master/estraverse.js"></script>
<script src="http://cdnjs.cloudflare.com/ajax/libs/lodash.js/2.2.1/lodash.js"></script>
<script src="https://rawgithub.com/gfranko/amdclean/master/src/amdclean.js"></script>
```

* Use the global `amdclean` object and `clean()` method

```javascript
var cleanedCode = amdclean.clean('define("example", [], function() { var a = true; });');
```

## Requirements

* [Esprima](https://github.com/ariya/esprima) 1.0+

* [Lodash](https://github.com/lodash/lodash) 2.2.1+

* [Estraverse](https://github.com/Constellation/estraverse) 1.3.1+

* [Escodegen](https://github.com/Constellation/escodegen) 0.0.27+

## Optional Dependencies

* [r.js](https://github.com/jrburke/r.js/) 2.1.0+


## How it works

amdclean uses Esprima to generate an AST (Abstract Syntax Tree) from the provided source code, estraverse to traverse and update the AST, and escodegen to generate the new standard JavaScript code.  There are a few different techniques that amdclean uses to convert AMD to standard JavaScript code:


###Define Calls

_AMD_

```javascript
define('example', [], function() {

});
```

_Standard_

```javascript
var example = function () {

}();
```

---

_AMD_

```javascript
define('example', [], function() {
  return function(name) {
    return 'Hello ' + name;
  };
});
```

_Standard_

```javascript
var example = function (name) {
  return 'Hello ' + name;
};
```

---

_AMD_

```javascript
define('example', [], function() {
  return 'I love AMDClean';
});
```

_Standard_

```javascript
var example = 'I love AMDClean';
```

---

_AMD_

```javascript
define('example', ['example1', 'example2'], function(one, two) {

});
```


_Standard_

```javascript
var example = function (one, two) {

}(example1, example2);
```

---

_AMD_

```javascript
define("backbone", ["underscore","jquery"], (function (global) {
    return function () {
        var ret, fn;
        return ret || global.Backbone;
    };
}(this)));
```


_Standard_

```javascript
var backbone = window.Backbone;
```

---

_AMD_

```javascript
define('third',{
  exampleProp: 'This is an example'
});
```

_Standard_

```javascript
var third = {
  exampleProp: 'This is an example'
};
```

---

###Require Calls

**Note:** `require(['someModule'])` calls are removed from the built source code

_AMD_

```javascript
require([], function() {
  var example = true;
});
```

_Standard_

```javascript
(function () {
    var example = true;
}());
```

---

_AMD_

```javascript
require(['anotherModule'], function(anotherModule) {
  var example = true;
});
```

_Standard_

```javascript
(function (anotherModule) {
    var example = true;
}(anotherModule));
```


##Options

The amdclean `clean()` method accepts a string or an object.  Below is an example object with all of the available configuration options:

```javascript
amdclean.clean({
  // The source code you would like to be 'cleaned'
  'code': '',
  // The relative file path of the file to be cleaned.  Use this option if you
  // are not using the code option.
  // Hint: Use the __dirname trick
  'filePath': '',
  // The modules that you would like to set as window properties
  // An array of strings (module names)
  'globalModules': [],
  // Determines if all of your local modules are stored in a single global
  // object (helps with scoping in certain cases)
  'globalObject': false,
  // Determines the name of your global object that stores all of your global
  // modules
  // Note: If using a global object, try to override this name with a smaller
  //       name since it will be referenced throughout the code (don't worry
  //       about it if you are using a minifier)
  'globalObjectName': 'amdclean',
  // All esprima API options are supported: http://esprima.org/doc/
  'esprima': {
    'comment': true,
    'loc': true,
    'range': true,
    'tokens': true
  },
  // All escodegen API options are supported: https://github.com/Constellation/escodegen/wiki/API
  'escodegen': {
    'comment': true
  },
  // If there is a comment (that contains the following text) on the same line
  // or one line above a specific module, the module will not be removed
  'commentCleanName': 'amdclean',
  // The ids of all of the modules that you would not like to be 'cleaned'
  'ignoreModules': [],
  // Determines which modules will be removed from the cleaned code
  'removeModules': [],
  // Determines if all of the require() method calls will be removed
  'removeAllRequires': false,
  // Determines if all of the 'use strict' statements will be removed
  'removeUseStricts': true,
  // Allows you to pass an expression that will override shimmed modules return
  // values e.g. { 'backbone': 'window.Backbone' }
  'shimOverrides': {},
  // Prevents multiple global objects from being instantiated when using the
  // onBuildWrite Require.js hook
  // Set this to false if you are using AMDClean for more than one build AND
  // are using the onModuleBundleComplete Require.js hook
  'rememberGlobalObject': true,
  // Determines how to prefix a module name with when a non-JavaScript
  // compatible character is found 
  // 'standard' or 'camelCase'
  // 'standard' example: 'utils/example' -> 'utils_example'
  // 'camelCase' example: 'utils/example' -> 'utilsExample'
  'prefixMode': 'standard',
  // A hook that allows you add your own custom logic to how each moduleName is
  // prefixed/normalized
  'prefixTransform': function(moduleName) { return moduleName; },
  // Wrap any build bundle in a start and end text specified by wrap
  // This should only be used when using the onModuleBundleComplete RequireJS
  // Optimizer build hook
  // If it is used with the onBuildWrite RequireJS Optimizer build hook, each
  // module will get wrapped
  'wrap': {
    'start': '',
    'end': ''
  }
})
```


## Unit Tests

All unit tests are written using the [jasmine-node](https://github.com/mhevery/jasmine-node) library and can be found in the `test/specs/` folder.  You can run the unit tests by typing: `npm test`.

## Contributing

Please send all PR's to the `dev` branch.

If your PR is a code change:

1.  Update `amdclean.js` inside of the `src` directory.
2.  Add a Jasmine unit test to `convert.js` inside of the `test/specs` folder
3.  Install all node.js dev dependencies: `npm install`
4.  Install gulp.js globally: `sudo npm install gulp -g`
5.  Lint, Minify, and Run all unit tests with Gulp: `gulp`
6.  Verify that the minified output file has been updated in `build/amdclean.min.js`
7.  Send the PR!

**Note:** There is a gulp `watch` set up called, `amdclean-watch`, that will automatically lint, minify, and run all the AMDClean unit tests when `src/amdclean.js` is changed.  Feel free to use it.


## FAQ

__Why would I use AMDClean instead of Almond.js?__

 - Although Almond is very small (~1k gzipped and minified), most JavaScript library authors do not want to have to include it in their library's source code.  AMDClean allows you to use AMD without increasing your library's file size.

__Do I have to use the onModuleBundleComplete Require.js hook?__

 - Nope, you may use the `onBuildWrite` Require.js hook instead.  Like this:
```javascript
onBuildWrite: function (moduleName, path, contents) {
    return module.require('amdclean').clean(contents);
}
```

__AMDClean does not seem to be cleaning shimmed modules.  What am I doing wrong?__

 - Since Require.js does not expose the [shim](http://requirejs.org/docs/api.html#config-shim) functionality within the `onBuildWrite` config property, you must use the `onModuleBundleComplete` config property instead.  Like this:

 ```javascript
onModuleBundleComplete: function (data) {
  var fs = require('fs'),
    amdclean = require('amdclean'),
    outputFile = data.path;
  fs.writeFileSync(outputFile, amdclean.clean({
    'filePath': outputFile,
    'globalObject': true
  }));
}
 ```
 
__Is AMDClean only for libraries, or can I use it for my web app?__

 - You can use it for both!  The [0.6.0](https://github.com/gfranko/amdclean/releases/tag/0.6.0) release provided support for web apps.

__My comments seem to be getting removed when I use AMDClean.  What am I doing wrong?__

 - Before the `1.0.0` release, this was the default behavior.  If you update to `1.0.0` or later, you should see your comments still there after the cleaning process.  Also, if you would like your comments to be removed, then you can set the `comment` **escodegen** option to `false`.

__What if I don't want all define() and require() method calls to be removed?__

 - If you don't want one or more define() and require() methods to be removed by `amdclean`, you have a few options.  If the module has a named module id associated with it, then you can add the associated module id to the `ignoreModules` option array.  Like this:

 ```javascript
var amdclean = require('amdclean');
amdclean.clean({
    'code': 'define("randomExample", function() { console.log("I am a random example"); });',
    'ignoreModules': ['randomExample']
});
 ```

 If there is not an associated module id, then you must put a comment with only the words _amdclean_ on the same line or one line above the method in question.  For example, `amdclean` would not remove the `define()` method below:

 ```javascript
// amdclean
define('example', [], function() {});
 ```

If you want to use different text than `amdclean`, you can customize the comment name by using the `commentCleanName` option.

__Why are define() method placeholder functions inserted into my source?__

- This is the default behavior of r.js when a module(s) is not wrapped in a define() method.  Luckily,  this behavior can be overridden by setting the `skipModuleInsertion` option to `true` in your build configuration.

__How would I expose one or more modules as a global window property?__

- You can use the `globalModules` option to list all of the modules that you would like to expose as a `window` property

__I am having a scope problem with all of the local module variables.  What can I do?__

- You can use the `globalObject` option to store all of your modules in a single global object that uses the top-most function scope.  You can even name that global object whatever you prefer by using the `globalObjectName` option.

__I replaced Almond.js with AMDClean and my file is bigger.  Why Is This?__

- There could be a couple of reasons:

  * Unneccessary files are still being included with your build. Make sure that both Almond.js and the RequireJS text! plugin are not still being included, since they are not needed.  You can use the `removeModules` option to make sure certain modules are not included (e.g. text plugin).

  * You are using AMDClean `0.6.0` or earlier.  The latest versions of AMDClean do a better job of optimizing modules.  Check out these release notes about optimization improvements: https://github.com/gfranko/amdclean/releases/tag/0.7.0 https://github.com/gfranko/amdclean/releases/tag/1.1.0

  *  Many of your individual module names are pretty long since they include the full path to a file.  An example is `text_templates_headinghtml`.  This module name could be changed to just `headinghtml` to save space. You can override the AMDClean module naming logic with the `prefixTransform` option to save some space.

__I am building a JavaScript library and want to provide conditional AMD support, but AMDClean seems to be wiping away my if statement.  How do I fix this?__

- Make sure that you have a comment (that matches your AMDClean `commentCleanName` option) one line above your conditional AMD if statement

__I don't like the way AMDClean normalizes the names of my modules with underscores.  Can I change this?__

- You sure can.  You can either use the `prefixMode` and change it to camelCase, or you can override all of the logic with your own logic by using the `prefixTransform` option hook.


## License

Copyright (c) 2014 Greg Franko Licensed under the MIT license.
