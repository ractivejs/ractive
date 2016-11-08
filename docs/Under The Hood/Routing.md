---
title: Routing
---
Client-side routing allows you to navigate around a web app without having to reload the page, using the [HTML5 history API](http://diveintohtml5.info/history.html) (or hash fragments at the end of a URL, in older browsers).

For a good introduction to routing, see [this Stack Overflow answer](http://stackoverflow.com/a/10076125/2742396).

Ractive doesn't have any built-in routing support, because it's a library not a framework (i.e. it works for you, you don't work for it).

If your app needs routing, there are a number of decent routing-only libraries available - see [microjs.com](http://microjs.com/#rout) for starters. [page.js](http://visionmedia.github.io/page.js/) is a popular choice. Alternatively, if you're already using Backbone (see [Using Ractive with Backbone](/latest/using-ractive-with-backbone), you could use [Backbone.Router](http://backbonejs.org/#Router).
