# Contributing

Many thanks for using Ractive and contributing to its development. The following is a quick set of guidelines designed to maximise your contribution's effectiveness.

## Reporting security vulnerabilities

If you think you've found a security vulnerability, please email [ractive-js-security@googlegroups.com](mailto:ractive-js-security@googlegroups.com) with details regarding the issue. Someone from the team will respond to assist you.

## Raising issues

Issues can be anything. It can be questions, feature requests, enhancements, optimizations and more.

For bug-related issues, please make sure you are using the [latest stable build](https://unpkg.com/ractive). The latest stable build can be found at [https://unpkg.com/ractive](https://unpkg.com/ractive). If the bug persists, it may have been fixed in the [latest "edge" build](https://unpkg.com/ractive@edge). Edge builds can be found at [https://unpkg.com/ractive@edge](https://unpkg.com/ractive@edge) and are updated on every change to the `dev` branch.

When filing an issue, please follow the issue template provided. The best issues contain a reproducible demonstration of the bug in the form of a demo. [This jsfiddle](https://jsfiddle.net/evschris/wxc00vup/) has a basic setup to get started with. Even better, you could create a failing test case using [this jsfiddle](http://jsfiddle.net/rich_harris/UG7Eq/) as a base.

## Development

### Required software

- Git
	- Ubuntu: `sudo apt-get install -y git`
	- macOS (via [Homebrew](https://brew.sh/)): `brew install git`
	- Windows: [Git for Windows](https://git-scm.com/download/win)
- An editor with the following integrations:
    - [ESLint](http://eslint.org/)
	- [EditorConfig](http://editorconfig.org/)
- A _real_ shell
	- Ubuntu: Use the built-in terminal.
	- macOS: Use the built-in terminal.
	- Windows: The shell that comes with Git for Windows.

Dependencies might require the following software to build native add-ons:

- [Python 2.7](https://www.python.org/download/releases/2.7/)
- Native Build Tools
	- Ubuntu: `sudo apt-get install -y build-essential`
	- macOS: `xcode-select --install`
	- Windows: [Visual C++ Build Tools](http://landinghub.visualstudio.com/visual-cpp-build-tools)

Tests might require `xvfb` when working on headless setups (i.e. ssh):

- xvfb
    - Ubuntu: `sudo apt-get install xvfb`

### Hacking Ractive

Fork the repository to your Github account. Click the "Fork" button on the [Ractive.js repository page](https://github.com/ractivejs/ractive). Select the account to fork to if prompted. Then do the following:

```bash
# Clone your fork of the repo
git clone https://github.com/YOUR_USERNAME/ractive

# Move into the repo directory
cd ractive

# Install the dependencies
npm install

# Run a server for development
npm run dev:browser

# Run a build locally (linting, bundling, testing)
# Linux/Unix
npm run build:local

# Windows
npm run bundle:release

# The .build folder contains the various Ractive distributions
```

[http://localhost:4567](http://localhost:4567) serves the sandbox page which you can use to hack Ractive. The files can be found in the `sandbox` directory. [http://localhost:4567/tests](http://localhost:4567/tests) serves the unit tests which can be found in `tests/browser`. Modifications to `src`, `tests/browser`, `sandbox`, and `polyfills` will automatically rebuild the sources served in this mode.

### Style guide

Most of the coding standards are handled by ESLint and EditorConfig configurations. When using an editor with the proper integrations, the editor will guide you. In addition, builds will fail if the coding standards are not adhered. Above all, code should be clean, readable, and commented where necessary.

## Testing

Tests use [QUnit](https://qunitjs.com/). Check out [their API documentation](https://api.qunitjs.com/) to learn more on how to write QUnit tests.

As mentioned in the previous section, you can run `npm run dev:browser` to serve the sandbox page on [http://localhost:4567](http://localhost:4567) and the browser-based QUnit tests on [http://localhost:4567/tests](http://localhost:4567/tests). To run the full battery of tests headlessly, run `npm run build:local` in the terminal. This will run both browser and Node.js tests.

Tests can be found in the `tests` directory, separated by platform and functionality. The `helpers` directory contains files common to all tests, but do not contain tests. To write tests, simply look for an existing file named after the functionality you're testing.

A sample test file will look like this:

```js
// A short description of the test and the associated Github issue number.
test( 'The thing that is supposed to happen does in fact happen (#42)', t => {

    // Your test case here. Always put messages on the assertions.
    const ractive = new Ractive({});
    t.ok(ractive, 'should create an instance');
});
```

### Guidelines

- Test as few things per `test`.
- Test against the public API, not against implementation details.
- Tests should be isolated, portable, and readable.
- Tests should clean up after themselves.
- Tests and assertions should be described properly.

### Utility functions

Utility functions can be found in `tests/helpers/test-config` module to aid in writing tests. It has the following helper functions and properties:

- `initModule (Function)` - `QUnit.module` with additional setup.
- `onWarn (Function)` - Accepts a function and assigns it as `console.onwarn`.
- `onLog (Function)` - Accepts a function and assigns it as `console.log`.
- `hasUsableConsole (boolean)` - A boolean indicating the presence of a console.
- `beforeEach (Function)` - Qunit's `beforeEach` that integrates with `initModule`.
- `afterEach (Function)` - Qunit's `afterEach` that integrates with `initModule`.

Sometimes it's necessary to use `beforeEach` and `afterEach` in order to avoid repeating lots of code. However, **you should try to avoid them** – it prevents tests from being portable and makes them hard to read when they're on their own. A test suite is one of the rare occasions when you shouldn't worry too much about DRY.

### Triggering DOM events

You can use [simulant](https://github.com/rich-harris/simulant) to simulate DOM interaction in tests (i.e. clicks, mouseovers, etc.). It is exposed to the unit tests as the `simulant` global module.

```js
import { fire } from 'simulant';

test( 'Click events work', t => {
  t.expect( 1 );

  const ractive = new Ractive({
    el: fixture,
    template: `<button on-click='test(42)'>click me</button>`,
    test ( answer ) {
      t.equal( answer, 42 );
    }
  });

  // Simulate click
  fire( ractive.find( 'button' ), 'click' );
});
```




## Pull requests

All pull requests are welcome. To create a pull request, simply build your code on a branch using Ractive's [`dev` branch](https://github.com/ractivejs/ractive/tree/dev) as base. Then push that branch to your Github repo and submit a PR of that branch against Ractive's `dev` branch. To expedite the process, please follow the pull request template provided.

If in doubt, *submit the PR*. A PR that needs tweaking is infinitely more valuable than a request that wasn't made. Other Ractive developers will help you refine your pull request.

## Contributor License Agreement

There's no contributor license agreement. Contributions are made on a common sense basis. Ractive is distributed under the [MIT license](../LICENSE.md), which means your contributions will be too.
