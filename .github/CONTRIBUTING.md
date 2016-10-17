# Contributing to Ractive.js

Many thanks for using Ractive and contributing to its development. The following is a quick set of guidelines designed to maximise your contribution's effectiveness.


## Reporting security vulnerabilities

If you think you've found a security vulnerability, please email [ractive-js-security@googlegroups.com](mailto:ractive-js-security@googlegroups.com) with details, and someone from the core team will respond to you.


## Got a question or need help?

If you're having trouble getting Ractive to do what you want, there are a couple of places to get help:

- [The Ractive Documentation](http://docs.ractivejs.org).
- [Create a new issue](https://github.com/ractivejs/ractive/issues/new) on Github.
- Ask a question on [Google Groups](https://groups.google.com/forum/#!forum/ractive-js).
- Ask a question on [Stack Overflow](https://stackoverflow.com/questions/ask) with the [`ractivejs`](http://stackoverflow.com/questions/tagged/ractivejs) tag.
- Send us a tweet via [@RactiveJS](http://twitter.com/RactiveJS).


## Raising issues

Before submitting an issue, please make sure you're using the latest released version. A copy of the latest can be found at [https://unpkg.com/ractive](https://unpkg.com/ractive).

If the bug persists, it may have been fixed in the latest development version. You can always get the most recent successful build from [http://cdn.ractivejs.org/edge/ractive.js](http://cdn.ractivejs.org/edge/ractive.js). Edge builds are periodically published to as [https://unpkg.com/ractive@edge](https://unpkg.com/ractive@edge).

The best issues contain a reproducible demonstration of the bug in the form of a JSFiddle or similar. [This fiddle](https://jsfiddle.net/evschris/wxc00vup/) has a basic setup to get started with. Even better, you could create a failing test case using [this fiddle](http://jsfiddle.net/rich_harris/UG7Eq/) as a base.


## Pull requests

**Pull requests against the master branch will not be merged!**

All pull requests are welcome. You should create a new branch, use the [dev branch](https://github.com/ractivejs/ractive/tree/dev) as base, and submit the PR against the dev branch.

Before submitting, run `npm run build` which will concatenate, lint and test the code to ensure the build passes. Don't include files from outside the `src` and `test` folders in the PR.

If in doubt, *submit the PR*. A PR that needs tweaking is infinitely more valuable than a request that wasn't made because you were worrying about meeting these requirements.

## Code Style Guide

There isn't (yet) a formal style guide for Ractive, so please take care to adhere to existing conventions:

* Tabs, not spaces!
* Variables at the top of function declarations
* Semi-colons
* Single-quotes for strings
* Liberal whitespace:

```js
// this...
var foo = function ( bar ) {
	var key;

	for ( key in bar ) {
		doSomething( bar, key ); // no space between function name and bracket for invocations
	}
};

// ...NOT this
var foo = function(bar){
	for(var key in bar){
		doSomething(bar, key);
	}
}
```

Above all, code should be clean and readable, and commented where necessary. Please include test cases, especially if you add a feature!


## Contributor License Agreement

There's no contributor license agreement. Contributions are made on a common sense basis. Ractive is distributed under the [MIT license](../LICENSE.md), which means your contributions will be too.
