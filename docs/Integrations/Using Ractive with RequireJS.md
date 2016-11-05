---
title: Using Ractive with RequireJS
---
*Psst! Looking for the [Ractive + RequireJS sample application](https://github.com/RactiveJS/requirejs-ractive/tree/master/sample)?*

If Ractive detects that you're using an [AMD](https://github.com/amdjs/amdjs-api/wiki/AMD) module loader (in other words, if `typeof define !== 'undefined' && define.amd`) such as [RequireJS](http://requirejs.org/), it will register itself as an AMD module rather than as a browser global.

You'd then use Ractive the same as you'd use any other module, such as in this (contrived, oversimple) example:

```js
// define our main application, with an 'init' method to call when
// the DOM is ready etc
define([ 'jquery', 'Ractive' ], function ( $, Ractive ) {

  'use strict';

  var app = {
    init: function () {

      // load our template with jQuery AJAX
      $.ajax( 'templates/main.html' ).then( function ( mainTemplate ) {

        // render our main view
        this.mainView = new Ractive({
          el: 'container',
          template: mainTemplate
        });
      });
    }
  };

  return app;

});
```

## Loading templates without AJAX

We can do one better than that. Rather than stuffing our code full of asynchronous logic, we can use AMD to do the donkey work for us.

Include the [RequireJS text loader plugin](https://github.com/requirejs/text) in the root of your project (or whatever you've specified as the RequireJS `baseUrl`) - you can now do this (note we no longer require jQuery):

```js
// define our main application, with an 'init' method to call when
// the DOM is ready etc
define([ 'Ractive', 'text!templates/main.html' ], function ( Ractive, mainTemplate ) {

  'use strict';

  var app = {
    init: function () {

      // render our main view
      this.mainView = new Ractive({
        el: 'container',
        template: mainTemplate
      });
    }
  };

  return app;

});
```

But we can do even better. If you use the [Ractive RequireJS loader plugin](https://github.com/RactiveJS/require-ractive-plugin), it will pre-parse the template for us. We'll see in a moment why that's useful.

Put the plugin in the same folder as the text loader plugin (which the Ractive plugin depends on). Note that we can omit the `'.html'` file extension:

```js
// define our main application, with an 'init' method to call when
// the DOM is ready etc
define([ 'Ractive', 'rv!templates/main' ], function ( Ractive, mainTemplate ) {

  'use strict';

  var app = {
    init: function () {

      // render our main view
      this.mainView = new Ractive({
        el: 'container',
        template: mainTemplate
      });
    }
  };

  return app;

});
```


## Using the optimiser

You might wonder why the third example is better than the second - after all, we've basically just added another middleman, right?

The answer is that you can now use the [RequireJS optimiser](http://requirejs.org/docs/optimization.html) to parse your template as part of your build process. The optimiser converts your project into a single minified file, which in most cases makes your app much quicker to load for the end user (because the browser only needs to make one HTTP request, and the total file size is reduced).

By pre-parsing templates, we save browsers having to do it, which shaves a few milliseconds off at render time.

So you get the best of both worlds - your templates stay neatly organised in their own files, where you can easily edit them, and the user gets the best possible experience.

If you're *really* anal about performance, you can tweak things further still. We don't need the loader plugins any more (because everything has been inlined), but they're still there in our optimised file. We can instruct the optimiser to 'stub them out', saving ourselves a few precious bytes. In your optimiser config, add the following option:

```js
({
    stubModules: [ 'rv', 'text' ]
})
```

(This assumes you're using a `build.js` file, or a build system like Grunt. If you're using the optimiser on the command line it will be different - consult the [documentation](http://requirejs.org/docs/optimization.html) for more info.)

Getting to grips with AMD and RequireJS can be tricky at first, but it's worth the effort. Good luck!