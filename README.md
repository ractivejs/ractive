<p align="center"><img src ="https://avatars1.githubusercontent.com/u/4751469?v=3&s=100"></p>

# Ractive.js - Next-generation DOM manipulation
[![npm version](https://img.shields.io/npm/v/ractive.svg?style=flat-square)](https://www.npmjs.com/package/ractive) [![devDependency Status](https://img.shields.io/david/dev/ractivejs/ractive.svg?style=flat-square)](https://david-dm.org/RactiveJS/Ractive#info=devDependencies) [![Build Status](https://img.shields.io/travis/ractivejs/ractive/dev.svg?style=flat-square)](https://travis-ci.org/ractivejs/ractive) [![Coverage Status](https://img.shields.io/coveralls/ractivejs/ractive/dev.svg?style=flat-square)](https://coveralls.io/github/ractivejs/ractive?branch=dev) [![npm downloads](https://img.shields.io/npm/dm/ractive.svg?style=flat-square)](https://www.npmjs.com/package/ractive) [![Twitter Follow](https://img.shields.io/twitter/follow/ractivejs.svg?style=flat-square)](https://twitter.com/ractivejs)
 

## What is Ractive.js?

It's a JavaScript library for building reactive user interfaces in a way that doesn't force you into a particular framework's way of thinking. It takes a radically different approach to DOM manipulation - one that saves both you and the browser unnecessary work.

Features include...

- Data-binding, with a beautiful declarative syntax.
- Event handling that doesn't make you tear your hair out.
- Flexible and performant animations and transitions.
- And much more!

To get a feel for how it will make your life as a web developer easier, visit [ractivejs.org](http://ractivejs.org), follow the [interactive tutorials](http://learn.ractivejs.org), or try the [60 second setup](http://ractivejs.org/60-second-setup).


## Documentation and Help

If you don't find what you're looking for in the [docs](http://docs.ractivejs.org), here are other channels you can ask:

- [Create a new issue](https://github.com/ractivejs/ractive/issues/new) on Github.
- Ask a question on [Google Groups](https://groups.google.com/forum/#!forum/ractive-js).
- Ask a question on [Stack Overflow](https://stackoverflow.com/questions/ask) with the [`ractivejs`](http://stackoverflow.com/questions/tagged/ractivejs) tag.
- Send us a tweet via [@RactiveJS](http://twitter.com/RactiveJS).


## Contributing

Pull requests and issues are always welcome! Please read [CONTRIBUTING.md](.github/CONTRIBUTING.md) to learn how to contribute.


## Development

If you want to hack on Ractive, the first step is to fork the repo. Then do the following commands.

```bash
# Clone your fork of the repo
git clone https://github.com/YOUR_USERNAME/ractive

# Move into the repo directory
cd ractive

# Install the dependencies
npm install

# Run a server for development
npm start
```

Navigate to [localhost:4567](http://localhost:4567). You'll see:

- `ractive-legacy.js` - A build of Ractive that includes legacy browser support.

- `sandbox` - Contains some template files to help with debugging.

- `test` - The test suite.

To start development, copy the `sandbox/sample`, following the instructions therein. After the initial build, any subsequent changes will result in fast incremental rebuilds. If you're using Chrome, you can use the [LiveReload](https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei) plugin.

*The development server is served by [gobble](https://github.com/gobblejs/gobble) and is still in development. Please report any Gobble-related bugs to [Gobble's issue tracker](https://github.com/gobblejs/gobble/issues). Thanks!*


## Build

To build, the following must be met:

- A *real* shell. Linux and OS X should be good. Windows needs [MSYS](http://www.mingw.org/wiki/msys) or something similar at least on the path.

- On Windows, if you get an `EINVAL` when running the tests, you may need to update the `phantomjs` script in the `node_modules/.bin` to use `{ stdio: 'inherit' }` when spawning the child process instead of manually piping afterwards.

To run a complete build including linting, testing and minification:

```bash
npm run build
```

## Browser support

Tested successfully in IE8+ and all modern browsers. For legacy browser support, use [the builds with suffix `legacy` in the filename](http://cdn.ractivejs.org/latest/ractive-legacy.js). These builds include polyfills and other essential features required by Ractive. If your experience differs [please let us know](https://github.com/ractivejs/ractive/issues/new)!


## License

Copyright (c) 2012-16 Rich Harris and contributors. Released under an [MIT license](LICENSE.md).

