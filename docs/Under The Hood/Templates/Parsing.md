Before templates can be used, they must be parsed. Parsing involves reading in a template string and converting it to a tree-like data structure, much like a browser's parser would.

Ordinarily, parsing happens automatically. However you can use `Ractive.parse()` as a standalone function if, for example, you want to parse templates as part of your build process (it works in Node.js). See also {{{createLink 'Using Ractive with RequireJS'}}}.

The output of `Ractive.parse()` is an array or object (depending on whether the template contains [inline partials](partials#inline-partials) or not). Here's an example:


This contains everything Ractive needs to construct its bit of the DOM and set up data-binding, proxy event handlers, and transitions.

It's not designed to be human-readable or -editable, but rather to use as few bytes as possible. Typically a parsed template is only about 30-40% larger than the string version. (There is some useful testing to be done to see whether the tradeoff of piping the extra few bytes to users is worth the few milliseconds of parsing that it will save!)

Wherever possible (in other words, with whichever bits of a template don't use Ractive-specific features), the template will be stored as plain HTML.

