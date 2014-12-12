# gobble-6to5

Compile ES6 files with gobble and 6to5. Creates sourcemaps automatically.

## Installation

First, you need to have gobble installed - see the [gobble readme](https://github.com/gobblejs/gobble) for details. Then,

```bash
npm i -D gobble-6to5
```

## Usage

**gobblefile.js**

```js
var gobble = require( 'gobble' );
module.exports = gobble( 'src' ).transform( '6to5', options );
```

The `options` argument, if specified, is passed to 6to5 - consult the [documentation](http://6to5.github.io/usage.html). Sourcemaps are created by default (all the relevant information is filled in by Gobble, you don't need to specify `sourceMapName` options etc) - if you don't want that, pass `sourceMap: false`.


## License

MIT. Copyright 2014 Rich Harris
