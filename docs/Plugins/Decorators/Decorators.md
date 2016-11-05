---
title: Decorators
---

A decorator is a simple way to add behaviour to a node when it is rendered, or to augment it in some way. Decorators are a good way to teach Ractive tricks from other libraries, such as [jQuery UI](http://jqueryui.com/).

You can use existing decorators from the {{{createLink 'Plugins'}}} page, or you can easily create your own.

You can invoke one or more decorators on your elements by using a decorator directive in the form of `<div as-${decoratorName}>...</div>` e.g. `<div as-myDecorator>...</div>`. Decorator arguments can be passed in a list as the value of the directive e.g. `<div as-myDecorator="arg1, .some.other.arg2, 10 * @index" as-somethingElseToo>...</div>`. Arguments are resolved from the  element's context and passed to the decorator. Updates to the arguments will cause the `update` method of the decorator to be called with the new values if the decorator supports updates. If the decorator does not support updates, it will be torn down and recreated with the new argument values.

## Creating decorator plugins

See {{{createLink 'Writing decorator plugins'}}} to learn how to create your own decorators.
