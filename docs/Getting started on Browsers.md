---
title: Get started
---

Welcome! These pages aim to provide all the information you need to master Ractive.

If you see something wrong, out of date, or missing from this documentation, please check out our {{{createLink 'Known issues, FAQs, and Tips' 'known issues and FAQs'}}}, [raise an issue on GitHub](https://github.com/ractivejs/docs.ractivejs.org/issues) or - even better - submit a pull request. Your fellow Ractive users will thank you!

Using Ractive is very simple. An instance is created using `new Ractive({...})`
with the desired options:

```js
var ractive = new Ractive({
  el: 'container',
  template: '<p>\{{greeting}}, \{{recipient}}!</p>',
  data: { greeting: 'Hello', recipient: 'world' }
});
```

While there are no _required_ options, the three shown above - __el__ement, __template__ and __data__ - are the most common. They specify __what data__ to bind to __what template__ and __where__ it should be placed
in the __html document__.

A good way to get up and running is with the [60 second setup](http://ractivejs.org/60-second-setup). After that, working your way through the [interactive tutorials](http://learn.ractivejs.org) will familiarise you with the various ways you can use Ractive.

Checkout the {{{createLink 'Options' 'Configuration Options'}}} to learn more about
all the available options.

If you get stuck at any point, visit the {{{createLink 'Get support'}}} page to find help.

*Documentation for previous versions: [0.3.9](../0.3.9), [0.4.0](../0.4.0), [0.5.x](../0.5), [0.6.x](../0.6), [0.7.x](../0.7)*

*Documentation for latest version: [latest](../latest)*
