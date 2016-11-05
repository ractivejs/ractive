---
title: ractive.get()
---
> ### ractive.get( keypath )
> Returns the value at `keypath` (see {{{createLink 'Keypaths'}}})

> ### ractive.get()
> Returns a shallow copy of all data (the equivalent of `ractive.get('')`). This does not include {{{createLink 'computed properties' 'Computed Properties' }}}, but it does include any mappings if `ractive` happens to be a component instance with mappings.
