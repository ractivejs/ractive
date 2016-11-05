---
title: ractive.transitions
---
Each Ractive instance has a `transitions` property, which contains {{{createLink 'transitions' 'transition functions'}}} specific to that instance.

When an element with a specified `intro` or `outro` transition is added or removed, Ractive first looks at `ractive.transitions` to see if it can find the right transition function. If it fails, it then looks in `Ractive.transitions` (the {{{createLink 'ractive-transitions-global' 'global transitions registry'}}}).

Ordinarily, transitions are added to a Ractive instance as an {{{createLink 'initialisation-options' 'initialisation option'}}}, but it is possible to swap them out after initialisation (for example, if your app determines that the user's browser can't handle a particular transition, or due to a configuration change).


