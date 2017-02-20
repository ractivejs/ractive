---
title: Parallel DOM
---
Ractive works by maintaining a simplified model of the part of the DOM that it's responsible for. This model contains all the information - about data-binding, event handling and so on - that it needs to keep things up-to-date.

You can inspect the parallel DOM to understand what's going on under the hood, if you're into that sort of thing. Each Ractive instance, once rendered, has a `fragment` property. Each fragment has a number of properties:

* `contextStack` - the context stack in which mustache {{{createLink 'references'}}} should be evaluated
* `root` - a reference to the Ractive instance to which it belongs
* `owner` - the *item* that owns this fragment (in the case of the root fragment, the same as `root`)
* `items` - the items belonging to this fragment

*Items* means elements, text nodes, and mustaches. Elements may have fragments of their own (i.e. if they have children). A partial mustache will have a fragment, and a section mustache will have zero or more fragments depending on the value of its keypath.

Elements may also have attributes, which have a different kind of fragment (a *text fragment* as opposed to a *DOM fragment*), containing text and mustaches.

Each item has a `descriptor`, which is something like DNA. This comes straight from the {{{createLink 'ractive-parse' 'parsed template'}}}.

This is the briefest of overviews - if you want to gain a deeper understanding of what's going on under the hood, [use the source](https://github.com/RactiveJS/Ractive/tree/master/src).