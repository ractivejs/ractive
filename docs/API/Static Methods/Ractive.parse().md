---
title: Ractive.parse()
---
Before templates can be used, they must be parsed. Parsing involves reading in a template string and converting it to a tree-like data structure, much like a browser's parser would.

Ordinarily, parsing happens automatically. However you can use `Ractive.parse()` as a standalone function if, for example, you want to parse templates as part of your build process (it works in Node.js). See also {{{createLink 'Using Ractive with RequireJS'}}}.

The output of `Ractive.parse()` is an array or object (depending on whether the template contains [inline partials](partials#inline-partials) or not). Here's an example:

```html
<div class='gallery'>
  \{{#items}}
    <!-- comments get stripped out of the template -->
    <figure proxy-tap='select' intro='staggered'>
      <img class='thumbnail' src='assets/images/\{{id}}.jpg'>
      <figcaption>\{{( i+1 )}}: \{{description}}</figcaption>
    </figure>
  \{{/items}}
</div>
```

...gets turned into...

```js
[{"t":7,"e":"div","a":{"class":"gallery"},"f":[{"t":4,"r":"items","i":"i","f":[" ",{"t":7,"e":"figure","a":{"intro":"staggered"},"f":[{"t":7,"e":"img","a":{"class":"thumbnail","src":["assets/images/",{"t":2,"r":"id","p":4},".jpg"]}}," ",{"t":7,"e":"figcaption","f":[{"t":2,"x":{"r":["i"],"s":"❖0+1"},"p":4},": ",{"t":2,"r":"description","p":4}]}],"v":{"tap":"select"}}," "],"p":1}]}]
```

This contains everything Ractive needs to construct its bit of the DOM and set up data-binding, proxy event handlers, and transitions.

It's not designed to be human-readable or -editable, but rather to use as few bytes as possible. Typically a parsed template is only about 30-40% larger than the string version. (There is some useful testing to be done to see whether the tradeoff of piping the extra few bytes to users is worth the few milliseconds of parsing that it will save!)

Wherever possible (in other words, with whichever bits of a template don't use Ractive-specific features), the template will be stored as plain HTML.

You use `Ractive.parse()` like so:

```js
// options are, well, optional
parsed = Ractive.parse( template, options );
```


## Parser options

> ### preserveWhitespace *`Boolean`*
> Defaults to `false`. Whether or not to preserve whitespace in templates. (Whitespace in `<pre>` elements is always preserved.)

> ### sanitize *`Boolean` or `Object`*
> Defaults to `false`. If `true`, certain elements will be stripped from templates - `<applet>`, `<base>`, `<basefont>`, `<body>`, `<frame>`, `<frameset>`, `<head>`, `<html>`, `<isindex>`, `<link>`, `<meta>`, `<noframes>`, `<noscript>`, `<object>`, `<param>`, `<script>`, `<style>` and `<title>` - as will event attributes (e.g. `onclick`). Alternatively, pass in an object with an `elements` property containing an array of blacklisted elements, and an optional `eventAttributes` boolean (`true` means 'disallow event attributes').


