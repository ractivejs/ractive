---
title: Transitions
---

Transitions allow you to control how elements are first rendered and how they are removed from the DOM. They are added with transition directives in the form of `${name}-in`, `${name}-out`, and `${name}-in-out`, where each suffix corresponds to when the element is rendered, unrendered, or both, respectively.

```html
<div fade-in>This element will fade in gradually when it renders</div>
```

This works because (or rather, if) Ractive is able to find a `fade` function on either {{{createLink 'ractive-transitions-instance' 'ractive.transitions'}}} (i.e. instance-specific transitions) or {{{createLink 'ractive-transitions-global' 'Ractive.transitions'}}} (i.e. globally-available transitions).

Transitions can also be passed arguments in a list as the value of their attribute directive. Most transitions use a single options argument, so they typically look something like `<div fade-in="{ duration: 300, delay: @index * 5 }">...</div>`.

To start using transitions, download them from the {{{createLink 'Plugins'}}} page.


## Creating transition plugins

See {{{createLink 'Writing transition plugins'}}} to learn how to create your own transitions.
