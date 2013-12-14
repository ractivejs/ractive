Contributing to Ractive.js
==========================

Many thanks for using Ractive and contributing to its development. The following is a quick set of guidelines designed to maximise your contribution's effectiveness.


Got a question or need help?
----------------------------

If you're having trouble getting Ractive to do what you want, there are a couple of places to get help before submitting an issue:

* [Stack Overflow questions tagged ractivejs](http://stackoverflow.com/questions/tagged/ractivejs)
* [The Ractive wiki](https://github.com/RactiveJS/Ractive/wiki)
* [@RactiveJS on Twitter](http://twitter.com/RactiveJS)

Of course, if you've encountered a bug, then the best course of action is to raise an issue (if no-one else has!).


Raising issues
--------------

Before submitting an issue, please make sure you're using the [latest released version](https://raw.github.com/RactiveJS/Ractive/master/Ractive.js).

If the bug persists, it may have been fixed in the latest development version. New versions are developed in branches, named for the version number (e.g. at the time of writing, the development branch is [0.3.9](https://github.com/RactiveJS/Ractive/tree/0.3.9)). You can get the most recent builds from the `build` folder of this branch.

See the [branches page](https://github.com/RactiveJS/Ractive/branches) to find the newest development branch.

The best issues contain a reproducible demonstration of the bug in the form of a [JSFiddle](http://jsfiddle.net/WE5Ga/) or similar. A good tip when using these tools is to import Ractive via [rawgithub.com](https://rawgithub.com/), e.g. https://rawgithub.com/RactiveJS/Ractive/master/Ractive.js.


Pull requests
-------------


**Pull requests against the master branch will not be merged!**

All pull requests are welcome. You should create a new branch, based on the newest development branch (see above), and submit the PR against the dev branch.

*Caveat for what follows: If in doubt, submit the request - a PR that needs tweaking is infinitely more valuable than a request that wasn't made because you were worrying about meeting these requirements.*

Before submitting, run `grunt test` (which will concatenate, lint and test the code) to ensure the build passes - but don't include files from the `build` folder in the PR.

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

Above all, code should be clean and readable, and commented where necessary. If you add a new feature, make sure you add a test to go along with it!


Small print
-----------

There's no contributor license agreement - contributions are made on a common sense basis. Ractive is distributed under the MIT license, which means your contributions will be too.
