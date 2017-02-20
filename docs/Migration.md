Many of these migration notes are cribbed from the [CHANGELOG](https://github.com/ractivejs/ractive/blob/dev/CHANGELOG.md). While we strive to minimise breaking changes, and to highlight the ones we do introduce, if you discover an undocumented breaking change please edit this page.

# Migrating from 0.7.x

## What's new

- Ractive's data handling has been completely rewritten to use a full viewmodel hierarchy as opposed to the previous hashmap-like implementation. This has made the code much easier to reason about, and it should also eliminate many data-related bugs. It also has made large swaths of Ractive considerably faster.

- Spread arguments (`...arguments`) and `arguments` access is now available for method event handlers. Individual arguments are available using array notation (`arguments[n]`), dot notation (`arguments.0`), or `1`-based dollar vars, like regular expression matches (`$1`, `$2`, etc).

- There is now support for linking data to extra keypaths in the model. This is particularly handy for master-detail scenarios where you have a complex list of objects and you want to focus on a single one at a time. A keypath like `'foo.bar.bazzes.0'` can be linked to `'baz'` so that the detail section doesn't have to worry about a non-bindable expressions or copying objects around. Both sides of the link are automatically kept in sync. See ['ractive.link()'](API/Instance Methods/ractive.link()).

- You can now use ES2015 object literal shorthand in templates e.g. `{ foo }` is equivalent to `{ foo: foo }`.

- If you have object keys with `.`s in them, you can now escape them with a `\`. So if you have a `bar` object with a `foo.baz` property, it can be accessed with `bar.foo\.baz`. Keypaths in the template are given as escaped paths so that they can be used directly with Ractive methods. There are also a few new static methods on `Ractive` to deal with escaping, unescaping, splitting, and joining keypaths.

- `<textarea>`s now handle HTML content as plain text to match what happens in browsers. They can now also set up two-way binding with a single interpolator as content instead of using the value attribute e.g. `<textarea>{{someBinding}}</textarea>` is equivalent to `<textarea value="{{someBinding}}"></textarea>`.

- Progressive enhancement is now supported with a few limitations (see [`enhance`](API/Configuration/Options.md#enhance)). If you pass `enhance: true` when creating your Ractive instance, it will not discard the contents of its target element and will instead try to reuse elements and nodes as it builds the virtual DOM from its template. This option is incompatible with the `append` option.

- The `Object`, `String`, and `Boolean` globals are now accessible from within templates.

- You can now set up aliases with context and iterative mustache sections that can be used to clarify templates and avoid issues with object-literal context sections and two-way binding. For context sections, use `{{#with someExpressionOrRef as alias1, some.deeply.nested[reference].expression as alias2}}...{{/with}}` to set up as many aliases as you need. For iterative sections, you can alias the context with the iteration (the current item) by using `{{#each some.list as item}}...{{/each}}`. Partial contexts also support aliasing, since partial context is just a shortcut for `{{#with context}}{{>partial}}{{/with}}`, as `{{>somePartial some.path as alias1, some.other[expression](arg1, arg2) as alias2}}`.

- There is a new CSP-compatible parsing mode that collects all of the expressions in the template at the end of the parse and stores them as `function`s on the template root. At render-time, any expressions look for a corresponding pre-built function before using `new Function(...)` to create one. Templates parsed in this way are no longer JSON compatible. To enable this mode, pass `csp: true` when pre-parsing your template.

- If your environment supports it, you can now use Unicode characters from the Supplementary Multilingual Plane and the Supplemental Idiographic Plane in your templates.

- There are two new special references available on your templates for access to the current Ractive instance and your environment's global object. `@this` will resolve to the nearest Ractive instance in the template, which includes components should the template belong to one. `@global` resolves to `window` in most browsers and `global` in Node.js. Both special references are also available outside of the template so that Ractive can be notified of changes outside the template easily.

- Keywords can now be used as references, so you can now use `new`, `if`, `while`, etc as references.

- Keypaths within components are now adjusted to be relative to the component. If you need to access the path to the data relative to the root instance, you can use the new special reference `@rootpath`.

- Partials defined in `<script>` tags can now contain top-level inline partial definitions that will get added to the instance along with the scripte-defined partial.

- You can now retrieve the CSS for a Ractive instance with a new `toCSS` method. You can also get the CSS for all instances with a new static Ractive method of the same name.

- You can now trigger a transition with `ractive.transition( transition, node, options )`, and `node` can be supplied implicitly from an event handler. Transitions can now return a Promise and `complete` will automatically be called when the promise resolves.

- Class and style attributes now get special treatment that keeps them from clobbering external changes. There are also special attribute forms for targeting a single class or inline style at a time using e.g. `style-left="{{x}}px"` and `class-someClass="{{someCondition || someOtherCondition}}"`. For the special style form, additional hyphens in the attribute are turned into camel case. For the special class form, the truthiness of the value determines whether or not the class is added to the list.

- As `set` will create intermediate objects when setting an undefined keypath, array methods will now swap in an empty array instead of erroring when called with an undefined keypath. Trying to use an array method with a non-array value including `null` will still throw.

- Event objects created by event directives and the results of [`Ractive.getNodeInfo()`](API/Static Methods/Ractive.getNodeInfo.md) are now enhanced with a number of contextual helper methods to make interacting with Ractive in template-relative contexts programmatically easier. The old node info object properties are now deprecated, and their functionality has been replaced by the `resolve` and `get` methods.

- Transitioning elements will not longer keep unrelated elements from being removed. Transitions now have a safety check that forces them to complete within a short interval from their target duration, which keeps misbehaving transitions and browsers from causing elements to get stuck in the DOM.

- `elseif` and `else` blocks no longer include previous blocks' conditions in their own, so expensive computations are no longer repeated and conditions for `elseif` are no longer forced to be an expression. Instead, subordinate blocks connect with their siblings when they render and only show if all prior siblings have falsey conditions.

- `merge` can now be called with the same array that exists at the given keypath, and the differences will be computed from the model's cached array members. This allows extensive in-place modification of an array to be handled as a series of splice operations but in a single operation. Note that `merge` may be moved to a `set` option at some pooint in the future.

## Breaking changes and deprecation

- **Templates parsed with previous versions of Ractive are no longer compatible.**

- IE8 is no longer supported.

- Two-way binding is no longer allowed in computed contexts e.g. `{{#each filter(someList)}}<input value="{{.prop}}" />{{/each}}` because changes to the computed child (`filter(someList).0.prop` aren't kept in sync with their source (`someList.?.prop`) as Ractive doesn't know how to reverse the expression. There is an ongoing discussion about how to address this, including an open PR that would put this behavior behind a flag and attempt to keep the sources up to date as the computation children changed.

- Names in partial mustaches have been further relaxed to allow `/`s. They can also now handle relative contexts because partial name expressions no longer support spaces around the `.` delimiters in object paths. `{{> foo.bar.baz .bat}}` before this change would have parsed as a single expression to get the partial name from `foo.bar.baz.bat`. It will now get the name from `foo.bar.baz` and have a context provided from `.bat`.

- Other elements are no longer allowed within `<option>` elements.

- Integer literals in interpolators are now considered to be integer literal expressions rather than references. They were considered references before so that you could access array members by index within a context. If you need to access an array member within a context section, you can still do so with `{{this.0}}`.

- The private `_ractive` tracking data added to Ractive controlled DOM nodes has changed significantly. The format of `Ractive.getNodeInfo` objects is still compatible.

- `{{#with obj}}` will no longer render if `obj` is falsey (https://github.com/ractivejs/ractive/issues/1856)

- Method event calls and proxy events with arguments are now deprecated and being replaced with [event expressions](Concepts/Events/Method Calls.md).

- ['Event objects']() now have fairly comprehensive contextual helpers installed on them. The old `keypath`, `key`, `index` properties are deprecated.

- Element directives are now supported inside of conditionals. Part of this change and that of event expressions has changed the template format, and this, compiled templates from previous versions of Ractive are no longer compatible. The template syntax, while evolved, is still compatible with previous versions. Some of the deprecated constructs will be removed in a future version.

- The `intro`, `outro`, and `intro-outro` directives have been deprecated and replaced by named and suffixed directives `${name}[-in][-out]` e.g. `fade-in-out`. Arguments passed to these directives should no longer be wrapped in mustaches, as they are parsed as an array. Dynamism for transitions can be achieved with attribute sections.

- The `decorator` directive has similarly deprecated and replaced by prefixed and named directives `as-${decorator}` e.g. `as-ace-editor`. Arguments passed to these directives should also no longer be wrapped in mustaches, as they are also parsed as an array. Multiple decorators are now supported by simply including multiple directives e.g. `as-registered="'some-id'" as-validated="{ maxLen: 10, match: /^foo/ }"`.

- Accessing expression models via keypath is now deprecated and will be removed in a future version. Expression keypaths can overlap, which can cause unexpected things to happen for the overlapping paths. You can now use context methods on an event or node info object with relative keypaths to interact with expression contexts. For example: `{{#with some.expression()}}<button on-click="@this.set(@keypath + '.foo', 42)">set .foo to 42</button>{{/with}}` would become `{{#with some.expression()}}<button on-click="event.set('.foo', 42)">set .foo to 42</button>{{/with}}`.

- `modifyArrays` now defaults to `false`. If you modify arrays using splice operations directly, you will need to notify Ractive to sync with the changes afterwards.

# Migrating from 0.6.x

## What's new

- Components can now access their parents and containers using an official API.

- Binding directives may be set on elements that support two-way binding. These directives override the settings on the Ractive instance for `twoway` and `lazy`.

- Single-fire versions of `ractive.on` and `ractive.observe` are now available as `ractive.once` and `ractive.observeOnce`.

- Inline partials can now be defined within a new section `{{#partial partial-name}}...{{/partial}}`. The old comment syntax is now deprecated and will be removed in a future release.

- Inline partials are now scoped to their nearest element. If a partial reference sits in the template below an element with a matching inline partial, the inline partial will be used in the reference. This can be used as a sort of partial inheritance. If an inline partial is defined directly within a component tag or the root of the template, it will be added to the Ractive instance.

- Components may now yield to multiple inline partials by supplying the partial name with yield e.g. `{{yield some-name}}`. Yielding without a name will still result in non-partial content being yielded. Only inline partials may be yielded. Any partials, including inline and inherited, may still be referenced within a component using a plain partial section e.g. `{{>partial}}`.

- Partials can now be reset without resorting to manually un/re-rendering them using a wrapping conditional section. This can be done with the new [`resetPartial` method](API/Instance Methods/ractive.resetPartial().md) on Ractive instances.

- `this.event` is now available to method-call event handlers.

- Regular expression literals can now be used in template expressions.

- You can now escape mustaches with a '\' if you'd like them to appear in the template.

- `ractive.toggle` now works with patterns.

- The debug setting is no longer set per-instance. It has been replaced with `Ractive.DEBUG`, which defaults to true. You can set it automatically based on whether or not the your code has been minified with:

	```js
	Ractive.DEBUG = /unminified/.test(function(){/*unminified*/});
	```

## Breaking changes and deprecation

- `twoway` and `lazy` are now reserved attribute names to be used as binding directives.
- Inline partials now belong to their nearest element.
- The comment syntax for inline partials is now deprecated.
- `elseif` is now a reserved identifier.
- `ractive.data` is no longer available. Use `ractive.get()` to get a shallow copy of the data with any component mappings.
- Child data always overrides parent data, whether it is a POJO or not.
- `ractive.debug` has been replaced with the global `Ractive.DEBUG` flag.

# Migrating from 0.5.x

## Lifecycle events

- Ractive instances now emit *lifecycle events*. If you use `Ractive.extend(...)` with `init()`, `beforeInit()` or `complete()`, you will need to replace them - they will continue to work, but will be removed in a future version.

- `init()` can be replaced with one of the following methods, or you may need to split your code into both methods. Use `onrender()` for code that needs access to the rendered DOM, but is safe being called more than once if you unrender and rerender your ractive instance. Use `oninit()` for code that should run only once or needs to be run regardless of whether the ractive instance is rendered into the DOM.

- The `init()` method also no longer recieves an `options` parameter as the ractive instance now inherits _all_ options passed to the constructor. You can still access the options directly using the `onconstruct()` method.

- `beforeInit()` and `complete()` can be replaced directly with `onconstruct()` and `oncomplete()` respectively.

- See the [Lifecycle Events](API/Configuration/Lifecycle Events.md) page for more detail.

## Other Breaking changes

- `new Ractive()` now inherits all options as methods/properties including event hooks. If you have been passing data through custom initialisation options be aware that they will appended to your ractive instance.
- Using other elements besides `<script>` for templates is an now an error. Migrate any templates in non-script elements and include a non-javascript type so the browser does not try to interpret your template:

	```js
	<script id='template' type='text/ractive'>
		// Your template goes here
	</script>
	```

- New reserved events cannot be used for proxy event names, i.e. `<p on-click='init'></p>`. These include 'change', 'config', 'construct', 'init', 'render', 'reset', 'teardown', 'unrender', and 'update'. You will need to rename your events.
- Setting uninitialised data on a component will no longer cause it to leak out into the parent scope
- 'Smart updates', via `ractive.merge()` and `ractive.shift()` etc, work across component boundaries. In most cases this is the expected behavior.
- The CSS length interpolator has been removed.


# Migrating from 0.4.x

## Breaking changes

- Errors in observers and evaluators are no longer caught
- Nodes are detached as soon as any outro transitions are complete (if any), rather than when *all- transitions are complete
- (Outdated if you are moving to `0.6.x` or above) The options argument of `init: function(options)` is now strictly what was passed into the constructor, use `this.option` to access configured value.
- `data` with properties on prototype are no longer cloned when accessed. `data` from "baseClass" is no longer deconstructed and copied.
- Options specified on component constructors will not be picked up as defaults. `debug` now on `defaults`, not constructor
- Select bindings follow general browser rules for choosing options. Disabled options have no value.
- Input values are not coerced to numbers, unless input type is `number` or `range`
- `{{this.foo}}` in templates now means same thing as `{{.foo}}`
- Rendering to an element already render by Ractive causes that element to be torn down (unless appending).
- Illegal javascript no longer allowed by parser in expressions and will throw
- Parsed template format changed to specify template spec version.
	- Proxy-event representation
	- Non-dynamic (bound) fragments of html are no longer stored as single string
	- See https://github.com/ractivejs/template-spec for current spec.
- Arrays being observed via `array.*` no longer send `item.length` event on mutation changes
- Reserved event names in templates ('change', 'config', 'construct', 'init', 'render', 'reset', 'teardown', 'unrender', 'update') will cause the parser to throw an error
- `{{else}}` support in both handlebars-style blocks and regular mustache conditional blocks, but is now a restricted keyword that cannot be used as a regular reference
- Child components are created in data order
- Reference expressions resolve left to right and follow same logic as regular mustache references (bind to root, not context, if left-most part is unresolved).
- Improved attribute parsing and handling:
	- character escaping and whitespace handling in attribute directive arguments
	- boolean and empty string attributes
- Computed properties no longer create nested objects with keypath like names, i.e. `page.area: '${width} - ${height}'` creates a property accessible by `{{page.area}}` but not `{{#page}}{{area}}{{/page}}`
- The element into which the ractive instance was rendered is no longer available as `ractive.el`. See [`ractive.render()`](API/Instance Methods/ractive.render().md) and [`ractive.insert()`](API/Instance Methods/ractive.insert().md) for more information on moving ractive instances in the DOM.
