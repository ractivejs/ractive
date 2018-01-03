# utils-component

NOT MEANT TO BE PUBLISHED. It's meant to be embedded by tools.
## API
For the most part, the functions only deal with the currently processed component file. It doesn't care about dependencies and other modules - that's a loader's responsibility.

- `toParts(componentFileName, source)` - Decomposes a component file into its constituent parts.
- `toES(outputFileName, parts)` - Takes `toParts()` output and returns `{ code, map }`, with `code` in ES module format.
- `toCJS(outputFileName, parts)` - Takes `toParts()` output and returns `{ code, map }`, with `code` in CJS module format.
- `toAMD(outputFileName, parts)` - Takes `toParts()` output and returns `{ code, map }`, with `code` in AMD module format.
- `toConstructor(outputFileName, parts, resolver)` - Takes `toParts()` output and evaluates it into a Ractive component constructor.
    - `resolver` is a function that receives the raw,unresolved path (link hrefs and require call paths), and must return the dependency.
- `getModuleName(path)` - Takes a module path and returns the module file name.
- `getModulePath(path, base)` - Takes a module path and returns the resolved path, relative to `base` if supplied.
- `isComponentPath(path)` - Takes a module path and returns `true` if the path is a valid Ractive component file path (ends with `.ractive.html` or `.html`).

## Component-file changes
- Templates should now be wrapped with `<template>`. Note that this is NOT the `<template>` element nor does it act like it. It's just a wrapper section.
- There can only be one `<template>`, `<style>` and/or `<script>` top-level element in a component file.
- The only one other top-level element is `<link>`.
- Ractive components must now have the `.ractive.html` or `.html` extension.

## Differences from rcu:
- `rcu.parse()` is now `module.toParts`. This was done to open up `parse()` to be `Ractive.parse()`
- `rcu.make()` is now `module.toConstructor()`. This was done so it lines up with the rcu-builders functions.
- Parser and builder functions only care about the current module. Location, path, relativeness and dependencies are the loader's responsibility since resolution and path rules differ by tools.
- `imports` and `modules` are now merged together as `dependencies`.
- `loadImport` and `loadModule` is now merged with `require`. They're all dependencies after all.
- Ractive components in component file format should have `.ractive.html` or `.html` extension.
- Extensions are not mangled by the parser or builder. This is because tools like Rollup and Webpack use extension matching to apply plugins.
- Dependency graph is expected to be loaded prior to construction, or handled by the loader or its underlying mechanism.
- Source map functions no longer exposed. Makes no sense exposing them when they're written for the builders specifically.
- Source maps are hi-res out of the box.
- `getName` is now `getModuleName`.
- `resolve` is now `getModulePath`.
- An additional `isComponentPath` function is available to test module paths for Ractive components.
- The parse and build functions are purposely separated so that a third-party tool can manipulate the parser output before it is supplied to a builder
    - i.e. `builder(someThirdPartyTool(parser(source)))`

## Differences from rcu-builders:
- `amd()`, `cjs()` and `es6()` are now `toAMD()`, `toCJS()` and `toES()` respectively.
- All builders return `{ code, map }`

## What is still left to the loader/module system
- Path syntax.
- Module resolution.
- Dependency graph traversal and registration.
