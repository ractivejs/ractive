Getting Ractive.js
==================

The easiest way to download the latest released version of Ractive is to grab it from http://cdn.ractivejs.org/latest/{filename}.js, where {filename} is one of

* [ractive.js](http://cdn.ractivejs.org/latest/ractive.js)
* [ractive.min.js](http://cdn.ractivejs.org/latest/ractive.min.js) - minified version
* [ractive-legacy.js](http://cdn.ractivejs.org/latest/ractive-legacy.js) - IE8 compatible
* [ractive-legacy.min.js](http://cdn.ractivejs.org/latest/ractive-legacy.min.js)
* [ractive.runtime.js](http://cdn.ractivejs.org/latest/ractive.runtime.js) - excludes `Ractive.parse()` - assumes templates are parsed on the server or during build
* [ractive.runtime.min.js](http://cdn.ractivejs.org/latest/ractive.runtime.min.js)
* [ractive-legacy.runtime.js](http://cdn.ractivejs.org/latest/ractive-legacy.runtime.js)
* [ractive-legacy.runtime.min.js](http://cdn.ractivejs.org/latest/ractive-legacy.runtime.min.js)

If you'd like to get the most recent version, substitute 'edge' for 'latest' in the URL, e.g. http://cdn.ractivejs.org/edge/ractive.js. These builds have passed the tests but may include experimental features, so should not be used in production.

For specific stable releases, replace 'latest' with e.g. 'release/0.4.0'.


Installing with bower
---------------------

If you use [bower](bower.io) for frontend package management, you can do

```
$ bower install ractive
```

To download the edge version, use the `edge` tag:

```
$ bower install ractive#edge
```

(If you want to redownload it, you may need to clean bower's cache with `bower cache clean ractive`.)


Installing with npm
-------------------

```
$ npm install ractive
```

Starting with 0.4.0, releases live on the [build branch](https://github.com/ractivejs/ractive/tree/build). It's therefore possible to `npm install` the most recent builds straight from GitHub:

```
$ npm install git://github.com/ractivejs/ractive.git#v0.4.1-pre
```

(The `v0.4.1-pre` tag - which will change after each stable release - is equivalent to the `edge` tag, but npm requires valid semver tags.)
