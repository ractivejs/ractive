# grunt-es6-module-transpiler

> A Grunt task for processing ES6 module import/export syntax into one of AMD, CommonJS, YUI or globals using the es6-module-transpiler. Also allows you to temporarily enable ES6 modules for other tasks.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-es6-module-transpiler --save-dev
```

To use add the `transpile` task to your Grunt configuration.

### Using with RequireJS/CommonJS:

```js
grunt.loadNpmTasks('grunt-es6-module-transpiler');

grunt.initConfig({
  transpile: {
    main: {
      type: "cjs", // or "amd" or "yui"
      files: [{
        expand: true,
        cwd: 'lib/',
        src: ['**/*.js'],
        dest: 'tmp/'
      }]
    }
  }
});
```

### Using with Globals

```js
grunt.loadNpmTasks('grunt-es6-module-transpiler');

grunt.initConfig({
  transpile: {
    main: {
      type: "globals",
      imports: { bar: "Bar" },
      files: {
        'tmp/globals.js': ['test/fixtures/input.js'],
        'tmp/globals-bar.js': ['test/fixtures/bar.js']
      }
    }
  }
});
```

### Transpiling your files

Manually run the task with `grunt transpile` or include it as part of your build task:

```js
grunt.registerTask('build', ['clean', 'transpile', '...']);
```

### Resources

- [Using Grunt & the ES6 Module Transpiler](http://www.thomasboyt.com/2013/06/21/es6-module-transpiler) by Thomas Boyt

### Caveat

The module transpiler forces strict mode; there is no option to turn this off. If, like me, you typically use Mocha with [Chai](http://chaijs.com), this can cause a problem because Chai attempts to access `arguments.callee`, which violates strict mode. I switched to using [expect.js](https://github.com/LearnBoost/expect.js/) and it works great.

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
10/07/2013 v0.5.0 - Support for v0.3.0 of es6-module-transpiler; removes transpile:enable task as the feature no longer exists
07/09/2013 v0.4.1 - Improved windows support when using amd
07/09/2013 v0.4.0 - Update to v0.2.0 of es6-module-transpiler for new syntax support
05/28/2013 v0.3.0 - Add callback for dynamically specifying AMD modulename
05/02/2013 v0.2.0 - Fixes for globals, CoffeeScript, transpile:enable task for node scripts
04/17/2013 v0.1.0 - Initial release, supports basic transpile task
