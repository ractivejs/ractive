# Ractive Parser Overview

Ractive uses a recursive descent parser that is comprised of a number readers and converters that are responsible for parsing individual bits of the template AST. The root-level parsers are text, mustache, and element.

## Mustaches

Each type of mustache has its own reader that calls the appropriate expression or reference readers internally. For instance, the partial reader reads the current open mustache delimiter (defaults to `{{`) followed by a `>`. It then expects to find a relaxed reference, meaning it may contain dashes and slashes among other usually-forbidden characters. It may then optionally read a context expression or series of alias definitions

## Expressions

The expression readers are set arranged such that they can read valid ES expressions with the correct operator precedence by starting with ternary conditionals and trying different expression types from there. Once the expression tree has been parsed, it is flattened into an expression string and a list of references that are used within that string. If the parsing is done with `csp` (Content Security Policy) support enabled, then the expression strings are also turned into functions and attached to the output template structure so that the template can be used as-is from a script tag without `eval`ing.

## Cleanup

After all of the nodes have been parsed from the template, the template is cleaned up in a process that, among other things, merges adjacent text nodes and forms individual conditional sections out of `elseif`/`else` trees.
