---
title: Ractive.transitions
---
This is a set of globally-available (i.e, shared between all Ractive instances) {{{createLink 'transitions' 'transition functions'}}}. If an element with a specified `intro` or `outro` is added or removed, Ractive will first try to find the transition function on {{{createLink 'ractive-transitions-instance' 'ractive.transitions'}}} - if it fails, it will then look in `Ractive.transitions`.

A few standard transition plugins have been created and can be found on the {{{createLink 'Plugins' 'Plugins page' '-a-href-transitions-transitions-a-'}}}.

You can add your own transitions - they should adhere to the {{{createLink 'transitions' 'transition API' 'creating-transitions'}}}.
