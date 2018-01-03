# loader-browser

## API

- `loadComponent(module, map)` - Loads a component file and its dependencies recursively.
    - `map` - A map of resolved paths relative to current path and their resolved values.
    - Resolves with a constructor.
- `loadComponents(modules:string[], map)` - Loads multiple component files and their dependencies recursively.
    - `map` - A map of resolved paths relative to current path and their resolved values.
    - Resolves with an array of constructors in the same order as `modules`

## Differences from ractive-load
- Dropped support for Node. Node support will be handled by loader-node.
- `Ractive.load.modules` replaced by second arg.
- Resolution of components do request first, `map` next, then global.
- Resolution of non-components do `map` first, then global.
- Dropping multiple support. I personally don't like polymorphic functions.
    - `loadComponents` is in place.

## Notes
- Since you're using scripts instead of modules (the only way loader-browser is ever makes sense), it's assumed that dependencies live globally.
- `ractive-load` will not try to load non-component dependencies.
    - It will only try to load, parse, and evaluate component files.
    - If you expect modules, use a module system and the appropriate Ractive loader.
- loader-browser caches loaded deps, but only during the lifetime of the call (function-scoped). No cache is maintained by the module.
