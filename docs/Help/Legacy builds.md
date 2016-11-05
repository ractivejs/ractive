---
title: Legacy Builds
---
In a perfect world, every copy of Internet Explorer below version ~~10~~ 11 would be living out its days in a pleasant retirement home, playing bingo and fighting over the remote control with Lotus Notes, and the IE dev team would adopt a modern release cycle so that newer versions weren't constantly playing catch-up with the browsers built on open source.

Sadly that's not the case, and it's not just IE that's the problem - there are plenty of IT departments out there who think it's perfectly fine to lock their users to a version of Firefox that should have collected its bus pass a long time ago.

Fortunately, Ractive still caters for these browsers, but you need to use a legacy build. The legacy builds, which have obvious names like `ractive-legacy.js`, include various shims and polyfills that allow the grumpy old browsers to play with the kids - things like `Array.prototype.indexOf`, `addEventListener`, and so on. Newer browsers will simply ignore them, so you can use the legacy builds without any penalty other than the slightly larger file size.

You can find the builds here:

* http://cdn.ractivejs.org/latest/ractive-legacy.js - last stable release
* http://cdn.ractivejs.org/edge/ractive-legacy.js - most recent build
