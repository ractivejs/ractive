---
title: Templates
---
In Ractive, templates (until they get {{{createLink 'ractive-parse' 'parsed'}}}, at least) are just snippets of HTML, with a few differences. A template should be *well-formed* - Ractive's parser is not quite as forgiving as the HTML parsers found in browsers (though it does allow things like implicitly closed elements).

Strictly speaking, a Ractive template is not valid HTML (for one thing, 'valid HTML' describes an entire document, and we're only dealing with snippets), but *it doesn't matter*, even if you're the kind of obsessive who can't stand a single error in the [W3C validator](http://validator.w3.org/), because it all comes out as lovely standards-compliant DOM.

For reference, however, the differences between Ractive templates and HTML are listed on this page.

## Mustaches

The most obvious difference is that Ractive templates contain {{{createLink 'mustaches'}}} to facilitate data binding.

## Proxy event directives

Elements in a Ractive template can have {{{createLink 'proxy events' 'events' }}}, which look like attributes but don't get rendered to the DOM as attributes (they are intercepted, and used as event binding instructions instead):

```html
<button on-click='activate'>Activate!</button>
```

## Transitions

Another item in the set of things-that-look-like-attributes-but-aren't, {{{createLink 'transitions'}}} allow you to specify how elements should behave when they first get introduced to the DOM and when they get removed from it later:

```html
<div intro='fade'>This element will fade in gradually when it renders</div>
```
