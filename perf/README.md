# Ractive.js performance tests

This folder contains a simple app to test the performance of Ractive across a number of tests. Right now, it is very basic. Contributions welcome!


## Running the app

Clone this repo and install all its dependencies, if you haven't already:

```bash
git clone https://github.com/ractivejs/ractive
cd ractive
npm install
```

You will need to have [gobble-cli](https://github.com/gobblejs/gobble-cli) installed:

```bash
npm install -g gobble-cli
```

Inside this folder (`perf`), start building the app:

```
cd perf
gobble
```

Navigate to [localhost:4567](http://localhost:4567). You will see a list of test pages - open one. Click the big green button.


## Testing the current version

By default, the app will use the `edge` build. To rebuild, run `npm run build` on the command line. This will create a fresh build in the `build` folder.


## Testing old versions

Select old versions using the drop-down menu to see how performance has changed over time. Note that in some cases, a very fast result for an old version may indicate that the behaviour was previously incorrect, not that performance has degraded.


## Using 'control' to test changes during development

Copy the contents of the `build` folder to `perf/control` and test the `edge` version against `control` if you want to see how changes you're making affect performance.

```bash
rm control/*
cp ../build/* control
```


## Viewing profiles

If you're in a browser that supports `console.profile()` (i.e. Chrome) you can see profiles by opening your devtools.



## Writing more tests

Each `.js` file in `tests` defines an array of tests. A test has a `name`, a `test` function, and an optional `setup` function that runs before the test itself.

```js
tests = [
  {
    name: 'example test',
    setup: () => {
      window.TestComponent = Ractive.extend({
        /* ... */
      });
    },
    test: TestComponent => {
      var ractive = new window.TestComponent({ el: 'body' });
    }
  }
];
```

The `setup` function can be asynchronous - just take a `done` callback:

```js
tests = [
  {
    name: 'example test',
    setup: done => {
      window.TestComponent = Ractive.extend({
        /* ... */
      });

      doSomethingAsync().then( function () {
      	// if there's an error, pass it
      	done( null );
      });
    },
    test: () => {
      var ractive = new window.TestComponent({ el: 'body' });
    }
  }
];
```

You can use ES6 syntax (as long as it's supported by [es6-transpiler](https://github.com/termi/es6-transpiler)), which means you can use multi-line template strings.


## Skipping tests

If you want to run specific tests, add `solo: true` to the definition. Conversely, use `skip: true` to skip a test.
