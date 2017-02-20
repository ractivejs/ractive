# Contributing

Many thanks for using Ractive and contributing to its development. The following is a quick set of guidelines designed to maximise your contribution's effectiveness.

## Reporting security vulnerabilities

If you think you've found a security vulnerability, please email [ractive-js-security@googlegroups.com](mailto:ractive-js-security@googlegroups.com) with details regarding the issue. Someone from the team will respond to assist you.

## Raising issues

Issues can be anything. It can be questions, feature requests, enhancements, optimizations and more. To expedite the process, please follow the issue template provided, providing everything asked for to the best of your knowledge.

For bug-related issues, please make sure you are using the [latest stable build](https://unpkg.com/ractive). The latest stable build can be found at [https://unpkg.com/ractive](https://unpkg.com/ractive). If the bug persist, it may have been fixed in the [latest "edge" build](https://unpkg.com/ractive@edge). Edge builds can be found at [https://unpkg.com/ractive@edge](https://unpkg.com/ractive@edge) and are updated on every change to the `dev` branch.

The best issues contain a reproducible demonstration of the bug in the form of a JSFiddle or similar. [This fiddle](https://jsfiddle.net/evschris/wxc00vup/) has a basic setup to get started with. Even better, you could create a failing test case using [this fiddle](http://jsfiddle.net/rich_harris/UG7Eq/) as a base.

## Development

You will need the following software:

- Git
	- Ubuntu: `sudo apt-get install -y git`
	- macOS (via [Homebrew](https://brew.sh/)): `brew install git`
	- Windows: [Git for Windows](https://git-scm.com/download/win)
- An editor with the following integrations:
    - [ESLint](http://eslint.org/)
	- [EditorConfig](http://editorconfig.org/)
- A "real" shell
	- Ubuntu: Use the built-in terminal.
	- macOS: Use the built-in terminal.
	- Windows: The shell that comes with Git for Windows.

Dependencies might require the following additional software to build native add-ons.

- [Python 2.7](https://www.python.org/download/releases/2.7/)
- Native Build Tools:
	- Ubuntu: `sudo apt-get install -y build-essential`
	- macOS: `xcode-select --install`
	- Windows: [Visual C++ Build Tools](http://landinghub.visualstudio.com/visual-cpp-build-tools)

You must first fork the repository to your Github account. Click the "Fork" button on the [Ractive.js repository page](https://github.com/ractivejs/ractive). At the time of writing, it can be found on the top right of the page. Select the account to fork to if prompted. Then do the following:

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
npm run build:local
```

[http://localhost:4567](http://localhost:4567) will serve the sandbox page which can be found in `sandbox`. Use this page to hack Ractive. Modifications to `src` will automatically rebuild Ractive which is provided relative to this page.

[http://localhost:4567/tests](http://localhost:4567/tests) will serve the unit tests which can be found in `tests/browser`. Modifications to `tests/browser` will automatically rebuild the tests. Unit tests for both browser and Node.js use [QUnit](https://qunitjs.com/) as the test framework. Read [their API documentation](https://api.qunitjs.com/) to learn more on how to write QUnit tests.

## Style Guide

Most of the coding standards are handled by ESLint and EditorConfig configurations. If using an editor with the proper integrations, the editor will guide you. In addition, builds will fail if the coding standards are not adhered. Above all, code should be clean and readable, and commented where necessary.

## Pull requests

All pull requests are welcome. To create a pull request, simply build your code on a branch using Ractive's [`dev` branch](https://github.com/ractivejs/ractive/tree/dev) as base. Then push that branch to your Github repo and submit a PR of that branch against Ractive's `dev` branch. To expedite the process, please follow the pull request template provided, providing everything asked for to the best of your knowledge.

If in doubt, *submit the PR*. A PR that needs tweaking is infinitely more valuable than a request that wasn't made. Other Ractive developers will help you refine your pull request.

## Contributor License Agreement

There's no contributor license agreement. Contributions are made on a common sense basis. Ractive is distributed under the [MIT license](../LICENSE.md), which means your contributions will be too.
