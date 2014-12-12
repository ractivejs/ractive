# grunt-gobble

[Gobble](https://github.com/gobblejs/gobble) is the last build tool you'll ever need.

## Getting Started

First things first: you don't *need* Grunt to run Gobble. All you need is [gobble-cli](https://github.com/gobblejs/gobble-cli) and a build definition known as a [gobblefile](https://github.com/gobblejs/gobble/wiki/How-to-write-a-gobblefile).

But if you're already using Grunt and want to integrate Gobble, or you want to manage multiple build definitions, you can do so by installing the plugin:

```shell
npm install grunt-gobble --save-dev
```

Once the plugin has been installed, add this to your Gruntfile:

```js
grunt.loadNpmTasks( 'grunt-gobble' );
```

*Psst! If you're looking for a more streamlined way to organise Grunt tasks and config, check out http://bit.ly/grunt-happy.*


## The "gobble" task

In your project's Gruntfile, add a section named `gobble` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  gobble: {
    your_target: {
      // required for building the project
      dest: 'tmp/build',

      // optional - which port to use if serving the project. Defaults to 4567
      port: 5678,

      // optional - typically 'development' or 'production'. Defaults to 'development'.
      // The environment can be determined inside a build definition with `gobble.env()`
      environment: 'production',

      // optional - whether to always empty the contents of `dest`. If `false`, this
      // task will fail if `dest` is not empty. Defaults to `false`
      force: true,

      // optional - a string (path to build definition, relative to project root) or a
      // function that returns a gobble node. Defaults to 'gobblefile.js'
      config: function () {
        var gobble = require( 'gobble' );
        return gobble( 'src' ).transform( 'uglify-js' );
      }
    },
  },
});
```


## Serving your project

You can serve your project with the following command:

```bash
grunt gobble:your_target:serve
```

To build the project, omit the `:serve` or replace it with `:build`:

```bash
grunt gobble:your_target
```

If you run `grunt gobble` without specifying a target, all targets (if there are more than one) will be built.


## Contributing

Usual drill - try to adhere to existing conventions, add tests for any new features. Thanks!


## License

MIT.
