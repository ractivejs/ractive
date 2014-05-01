Ractive.js builds
=================

This branch contains the most recent successful builds of Ractive. It is updated automatically by [Travis-CI](https://travis-ci.org/ractivejs/ractive) every time new code is pushed to the [dev branch](https://github.com/ractivejs/ractive/tree/dev), and that code passes the test suite.

**Be aware** that these are *not* considered stable releases. For those, refer to the [releases](https://github.com/ractivejs/ractive/releases) tab.


Using edge builds in your projects (advanced)
---------------------------------------------

If you want to use these builds in your project, and you understand why that's a bad idea but are prepared to accept the consequences anyway, you can do so:

### downloading the file

You can always get the most recent 'edge' build from http://cdn.ractivejs.org/edge/ractive.js. You can use this in a `<script>` tag, though generally it's better to use a copy that's local to your project.

### bower

If you use bower you can install the lastest edge version with

```
$ bower install ractive#edge
```

You will need to clean bower's cache with `bower cache clean ractive` if you want to update to a more recent build.

### npm

**Hmmm.... this doesn't appear to work. If anyone has any ideas...**

To use non-stable builds with npm you need to use a git endpoint:

```
$ npm install git://github.com/ractivejs/ractive.git#edge
```
