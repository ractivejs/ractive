# changelog

# 0.9.0 (unreleased)

* Bug fixes
	* Observers on uninitialized data may be added during the `config` event (#2725)

* Breaking changes
	* All deprecations have been removed, including proxy events with args, un-prefixed method events, decorator="...", transition="...", the ractive.data getter, partial comment definitions, and lifecycle methods like `init` and `beforeInit`.
	* The template spec is now a bit simpler after the removal of deprecations, and templates parsed with previous versions of Ractive are no longer compatible.
	* Partial context (`{{>foo thisIsTheContext}}`) now only applies inside the partial template, meaning it is no longer equivalent to `{{#with thisIsTheContext}}{{>foo}}{{/with}}`. The with is wrapped around the content of `foo`, so that the context doesn't interfere with the partial expression.
	* Any partial may be yielded, so yielding non-inline partials will no longer warn.
	* The same partial may be yielded multiple times.
	* Events now fire in an initial implicit `this.` namespace. This means that with `this.on( '*.foo', handler )`, `handler` will be called if and component fires a `foo` event or if the `this` instance fires a `foo` event. 
	* The `noIntro` option now applies to any nested components that are also being rendered, unless they have their own explicit setting.
	* Legacy builds removed. Only regular and runtime builds are now available.
		* `Promise` shim required for IE11.
		* `requestAnimationFrame` polyfill required for IE10.
		* es5-shim required for non-ES5 browsers.
	* `ractive.nodes` no longer contains elements by id. The same functionality can be handled more safely and conveniently with a decorator.

* New features (experimental - feedback welcome!)
	* You can now create cross-instance links by passing an options object with a target instance e.g. `this.link('source.path', 'dest.path', { ractive: sourceInstance })`. This covers many of the cases handled by the `ractive-ractive` adaptor in a considerably more efficient manner.
	* There is now an API to manage embedding external instances i.e. out-of-template components. You can use `ractive.attachChild(otherRactive, { options })` and `ractive.detachChild(otherRactive)` to create a component relationship between two instances. There is a new anchor construct `<#anchorName />` that behaves mostly like a regular inline component except that it won't create its own Ractive instance. You can target an anchor when attaching a child by giving an anchor name as an option e.g. `ractive.attachChild(otherRactive, { target: 'anchorName' })`. Attached children need not be components, so you can attach a plain Ractive instance e.g. `const foo = new Ractive({ ... }); ractive.attachChild(foo);`.
	* `{{yield}}` can now be used with any partial, not just inlines, and it may also use an expression to look up the target partial. It basically behaves as a regular partial with a special context.
		* `{{yield}}` can also specify aliases, so that yielding is useful inside an iterative section. `{{yield partialName with foo as bar}}` and `{{yield with foo as bar}}` will make `foo` from the component context available to the `partialName` partial as `bar`.
	* You can specify that child keypaths of computations should trigger updates on the computation's dependencies, which _should_ have the effect of keeping the models involved in the computation in sync with changes to the computed models. The flag to enable this behavior at instance creation is `syncComputedChildren: true`. With that flag set, children of computations are available for two-way binding and mutation from event or `getNodeInfo` objects using relative keypaths.
	* `@.foo` has been introduced as shorthand for `@this.foo`. This mirrors the data shorthand `.foo` for `this.foo`.
	* You can now pop contexts using `^^/` in the same way that you can pop keypaths with `../`.
	* Special keypaths that resolve to Ractive instances now resolve using the proper model rather than a computation, so they now stay in sync.
	* There is now a special key `data` on special keypaths that resolve to Ractive instances that resolves to the instance's root model. This allows things like `@.root.data.foo` to keep the root instance `foo` reference in sync throughout the component tree.
	* There is a new Ractive-private shared store, `@shared`. This is roughly the same as `@global`, but it is not susceptible to interference from the global scope.
	* There is a new option, `resolveInstanceMembers`, which defaults to `true`, and when enabled, it adds the instance scope `@this` to the end of the reference resolution process. This means that as long as there are no conflicting members in the context hierarchy, things like `<button on-click="set('foo', 'bar')">yep</button>` work as expected. Note that if the resolved function will only be bound to the instance if it contains a `this` reference, which can be a little strange if you're debugging.
	* There is a new option, `warnAboutAmbiguity`, which defaults to `false`, and when set, it will issue a warning any time a reference fails to resolve at all or fails to resolve to a member in the immediate context.
	* API methods can now handle things like `ractive.set('~/foo', 'bar')`, mirroring how context methods for `getNodeInfo` and `event`s are handled. Things like `ractive.set('.foo', 'bar')` will now issue a warning and do nothing rather than creating an incorrect keypath (`<empty string>.foo`).
	* You can now trigger event listeners in the VDOM from event and node info objects e.g. with `<div on-foo="@global.alert('hello')" >` with `ractive.getNodeInfo('div').raise('foo');` will trigger an alert.
	* There are two new options available for subscribing events and observers when an instance is created using two new options.
		* `on` takes a hash of event listeners that will be subscribed just after the `construct` phase of instantiation, meaning that any lifecycle events after `construct` may also have listeners added in the event hash.
		* `observe` takes a hash of observers that will be subscribed just after the `config` phase of instantiation.
		* Both of these options are additive, so any subscriptions defined in component super classes are applied first in sequence from the root of the component class hierarchy down to the options of the instance being created.
		* The hashes can contain keys that could be passed directly to the matching method e.g. `ractive.on( key, ... )` or `ractive.observe( key, ... )`.
		* The hashes can contain values that are either a callback function or an object that has a `handler` property that is a callback function. If the object form is used, any additional keys are passed to the method. If a `once` property is supplied and is truthy, then the appropriate single-fire method will be used to subscribe. For instance `observe: { 'foo.* bar': { handler() { ... }, strict: true, once: true, defer: true } }` passed in an options object is equivalent to calling `ractive.observeOnce( 'foo.* bar', function() { ... }, { strict: true, defer: true } )` during the `init` phase of instantiation.
	* Event listener handles return from `ractive.on( ... )` now have methods to silence and resume the listener. The existing `cancel()` method now has siblings `isSilenced()`, `silence()`, and `resume()`. When a listener is silenced, it will not call its callback.
	* Like event listeners, observer listener handles also have methods to silence and resume the listener. While an observer is silenced, it will still track state changes internally, meaning the old value on the next call after being resumed will be the last value it observed, including those observed while it was silenced. It simply won't fire its callback while it is silenced.
	* You can now stop component outros from firing while a component is being unrendered by specifying `noOutro: true`, which mirrors the behavior of `noIntro`.
	* You can now specify whether or not transitions should occur if they are on a child element of another transitioning element by using:
		* Instance option `nestedTransitions`, which defaults to `true`, meaning that transitions will fire whether they are on elements that are children of other transitioning elements or not.
		* The transition option `nested`, which also defaults to `true`.
	* There's a new `ractive` command distributed with the node module that allows easy pre-parsing of templates and building of components. If you have the module installed locally, see `./node_modules/.bin/ractive` for more details.

* New features (stable)
	* `target` is now an alias for `el` when creating a Ractive instance.
	* You can now use spread expressions with array and object literals in expressions in addition to method calls. Object spreads will require `Object.assign` to be available.
	* There is a new lifecycle hook, `destruct` that fires after teardown is complete and any related transitions have completed.
	* Lifecycle events now receive the source Ractive instance as their last argument.
	* You can now use context-relative `observe` and `observeOnce` from event and node info objects.
	* You can now access decorator objects from event and node info objects using `obj.decorators.name`, where name is the decorator name as specified in the template e.g. `foo` in `<div as-foo />`.


# 0.8.7

* Bug fixes
	* Regression: hyphenated inline styles are set correctly again (#2796)


# 0.8.6

* Bug fixes
	* Unquoted attributes no longer consider `/` for content, fixing parse errors with unquoted attributes and self-closing elements (#2765)
	* Inline priority on style attributes e.g. `style="display: block !important"` is no longer lost (#2794)


# 0.8.5

* Bug fixes
	* Form elements nested inside yielders now correctly find their parents. This includes options finding their parent select (#2754)
	* Number bindings now record their initial value properly (#2671)


# 0.8.4

* Bug fixes
	* VDOM destruction now propagates correctly through all types of item (#2735)
	* Component events proxies no longer try to cancel an event that doesn't exist (#2731). A warning will now be issued in this situation.
	* `findAll` propagates through yielders correctly (#2743)

* Other changes
	* `{{#with foo}}` will now render if `foo` is an empty object or array, as it is valid context. `{{#foo}}` will _not_ render if `foo` is empty.


# 0.8.3

* Bug fixes
	* Non-isolated components now inherit adaptors from their parent - partial regression from 0.7.3
	* Bugs with `toHTML()` without DOM rendering in a few scenarios, including fixes for `class-` and `style-` attributes not being included in the string output.


# 0.8.2

* Bug fixes
	* Ractive will no longer create its own properties on adaptor objects.
	* Child paths on computations will now properly notify links, so component mappings involving a computed property will now update as expected.


# 0.8.1

* Bug fixes
	* Fixed issues with adaptors (#2693, #2698)
	* Fixed issues with observers (#2682, #2690, #2704)
	* CSS comments no longer break component styles (#2683)
	* ... and various other bugs (#2679, #2680, #2695)

* Other
	* You can now specify a new parse option `contextLines` that will give you more (or less) of the surrounding template with errors and warnings.
	* There is a new global `Ractive.WELCOME_MESSAGE` that tools can use to control the welcome message that Ractive prints on first init.
	* Deprecated event constructs will now issue a warning with context for each instance, so that it becomes easier to find proxy events with arguments or old-style, non-prefixed method events in templates.


# 0.8.0

* Breaking changes
	* **Templates parsed with previous versions of Ractive are no longer compatible.**
	* IE8 is no longer supported.
	* Two-way binding is no longer allowed in computed contexts e.g. `\{{#each filter(someList)}}<input value="\{{.prop}}" />\{{/each}}` because changes to the computed child (`filter(someList).0.prop` aren't kept in sync with their source (`someList.?.prop`) as Ractive doesn't know how to reverse the expression. There is an ongoing discussion about how to address this, including an open PR that would put this behavior behind a flag and attempt to keep the sources up to date as the computation children changed.
	* Names in partial mustaches have been further relaxed to allow `/`s. They can also now handle relative contexts because partial name expressions no longer support spaces around the `.` delimiters in object paths. `\{{> foo.bar.baz .bat}}` before this change would have parsed as a single expression to get the partial name from `foo.bar.baz.bat`. It will now get the name from `foo.bar.baz` and have a context provided from `.bat`.
	* Other elements are no longer allowed within `<option>` elements.
	* Integer literals in interpolators are now considered to be integer literal expressions rather than references. They were considered references before so that you could access array members by index within a context. If you need to access an array member within a context section, you can still do so with `\{{this.0}}`.
	* The private `_ractive` tracking data added to Ractive controlled DOM nodes has changed significantly. The format of `Ractive.getNodeInfo` objects is still compatible.
	* `\{{#with obj}}` will no longer render if `obj` is falsey (https://github.com/ractivejs/ractive/issues/1856)
	* `modifyArrays` now defaults to `false`. If you modify arrays using splice operations directly, you will need to notify Ractive to sync with the changes afterwards.

* Deprecated features
	* Method event calls and proxy events with arguments are now deprecated and being replaced with {{{createLink 'Method calls' 'event expressions' }}}.
	* {{{createLink 'events' 'Event objects' }}} now have fairly comprehensive contextual helpers installed on them. The old `keypath`, `key`, `index` properties are deprecated.
	* Element directives are now supported inside of conditionals. Part of this change and that of event expressions has changed the template format, and this, compiled templates from previous versions of Ractive are no longer compatible. The template syntax, while evolved, is still compatible with previous versions. Some of the deprecated constructs will be removed in a future version.
	* The `intro`, `outro`, and `intro-outro` directives have been deprecated and replaced by named and suffixed directives `${name}[-in][-out]` e.g. `fade-in-out`. Arguments passed to these directives should no longer be wrapped in mustaches, as they are parsed as an array. Dynamism for transitions can be achieved with attribute sections.
	* The `decorator` directive has similarly deprecated and replaced by prefixed and named directives `as-${decorator}` e.g. `as-ace-editor`. Arguments passed to these directives should also no longer be wrapped in mustaches, as they are also parsed as an array. Multiple decorators are now supported by simply including multiple directives e.g. `as-registered="'some-id'" as-validated="{ maxLen: 10, match: /^foo/ }"`.
	* Accessing expression models via keypath is now deprecated and will be removed in a future version. Expression keypaths can overlap, which can cause unexpected things to happen for the overlapping paths. You can now use context methods on an event or node info object with relative keypaths to interact with expression contexts. For example: `\{{#with some.expression()}}<button on-click="@this.set(@keypath + '.foo', 42)">set .foo to 42</button>\{{/with}}` would become `\{{#with some.expression()}}<button on-click="event.set('.foo', 42)">set .foo to 42</button>\{{/with}}`.

* New features
	* Ractive's data handling has been completely rewritten to use a full viewmodel hierarchy as opposed to the previous hashmap-like implementation. This has made the code much easier to reason about, and it should also eliminate many data-related bugs. It also has made large swaths of Ractive considerably faster.
	* Spread arguments (`...arguments`) and `arguments` access is now available for method event handlers. Individual arguments are available using array notation (`arguments[n]`), dot notation (`arguments.0`), or `1`-based dollar vars, like regular expression matches (`$1`, `$2`, etc).
	* There is now support for linking data to extra keypaths in the model. This is particularly handy for master-detail scenarios where you have a complex list of objects and you want to focus on a single one at a time. A keypath like `'foo.bar.bazzes.0'` can be linked to `'baz'` so that the detail section doesn't have to worry about a non-bindable expressions or copying objects around. Both sides of the link are automatically kept in sync. See {{{createLink 'ractive.link()'}}}.
	* You can now use ES2015 object literal shorthand in templates e.g. `{ foo }` is equivalent to `{ foo: foo }`.
	* If you have object keys with `.`s in them, you can now escape them with a `\`. So if you have a `bar` object with a `foo.baz` property, it can be accessed with `bar.foo\.baz`. Keypaths in the template are given as escaped paths so that they can be used directly with Ractive methods. There are also a few new static methods on `Ractive` to deal with escaping, unescaping, splitting, and joining keypaths.
	* `<textarea>`s now handle HTML content as plain text to match what happens in browsers. They can now also set up two-way binding with a single interpolator as content instead of using the value attribute e.g. `<textarea>\{{someBinding}}</textarea>` is equivalent to `<textarea value="\{{someBinding}}"></textarea>`.
	* Progressive enhancement is now supported with a few limitations (see {{{createLink 'options' 'enhance' 'enhance'}}}). If you pass `enhance: true` when creating your Ractive instance, it will not discard the contents of its target element and will instead try to reuse elements and nodes as it builds the virtual DOM from its template. This option is incompatible with the `append` option.
	* The `Object`, `String`, and `Boolean` globals are now accessible from within templates.
	* You can now set up aliases with context and iterative mustache sections that can be used to clarify templates and avoid issues with object-literal context sections and two-way binding. For context sections, use `\{{#with someExpressionOrRef as alias1, some.deeply.nested[reference].expression as alias2}}...\{{/with}}` to set up as many aliases as you need. For iterative sections, you can alias the context with the iteration (the current item) by using `\{{#each some.list as item}}...\{{/each}}`. Partial contexts also support aliasing, since partial context is just a shortcut for `\{{#with context}}\{{>partial}}\{{/with}}`, as `\{{>somePartial some.path as alias1, some.other[expression](arg1, arg2) as alias2}}`.
	* There is a new CSP-compatible parsing mode that collects all of the expressions in the template at the end of the parse and stores them as `function`s on the template root. At render-time, any expressions look for a corresponding pre-built function before using `new Function(...)` to create one. Templates parsed in this way are no longer JSON compatible. To enable this mode, pass `csp: true` when pre-parsing your template.
	* If your environment supports it, you can now use Unicode characters from the Supplementary Multilingual Plane and the Supplemental Idiographic Plane in your templates.
	* There are two new special references available on your templates for access to the current Ractive instance and your environment's global object. `@this` will resolve to the nearest Ractive instance in the template, which includes components should the template belong to one. `@global` resolves to `window` in most browsers and `global` in Node.js. Both special references are also available outside of the template so that Ractive can be notified of changes outside the template easily.
	* Keywords can now be used as references, so you can now use `new`, `if`, `while`, etc as references.
	* Keypaths within components are now adjusted to be relative to the component. If you need to access the path to the data relative to the root instance, you can use the new special reference `@rootpath`.
	* Partials defined in `<script>` tags can now contain top-level inline partial definitions that will get added to the instance along with the scripte-defined partial.
	* You can now retrieve the CSS for a Ractive instance with a new `toCSS` method. You can also get the CSS for all instances with a new static Ractive method of the same name.
	* You can now trigger a transition with `ractive.transition( transition, node, options )`, and `node` can be supplied implicitly from an event handler. Transitions can now return a Promise and `complete` will automatically be called when the promise resolves.
	* Class and style attributes now get special treatment that keeps them from clobbering external changes. There are also special attribute forms for targeting a single class or inline style at a time using e.g. `style-left="\{{x}}px"` and `class-someClass="\{{someCondition || someOtherCondition}}"`. For the special style form, additional hyphens in the attribute are turned into camel case. For the special class form, the truthiness of the value determines whether or not the class is added to the list.
	* As `set` will create intermediate objects when setting an undefined keypath, array methods will now swap in an empty array instead of erroring when called with an undefined keypath. Trying to use an array method with a non-array value including `null` will still throw.
	* Event objects created by event directives and the results of {{{createLink 'Ractive.getNodeInfo()'}}} are now enhanced with a number of contextual helper methods to make interacting with Ractive in template-relative contexts programmatically easier. The old node info object properties are now deprecated, and their functionality has been replaced by the `resolve` and `get` methods.
	* Transitioning elements will not longer keep unrelated elements from being removed. Transitions now have a safety check that forces them to complete within a short interval from their target duration, which keeps misbehaving transitions and browsers from causing elements to get stuck in the DOM.
	* `elseif` and `else` blocks no longer include previous blocks' conditions in their own, so expensive computations are no longer repeated and conditions for `elseif` are no longer forced to be an expression. Instead, subordinate blocks connect with their siblings when they render and only show if all prior siblings have falsey conditions.
	* `merge` can now be called with the same array that exists at the given keypath, and the differences will be computed from the model's cached array members. This allows extensive in-place modification of an array to be handled as a series of splice operations but in a single operation. Note that `merge` may be moved to a `set` option at some pooint in the future.

* Bug fixes and other changes - way too many to list

# 0.7.3

* Fixed reading templates from `<script>` tags in IE8 (#1908)
* Components with a `css` property can be created in node.js (#1927)
* Leading/trailing newlines inside elements are removed (#1851)
* Two-way contenteditable binding works with the `lazy: true` option (#1933)
* Better error for undefined/null templates (#1893)
* Internal tweaks (dependency updates, removal of .DS_Store files, fix tests in Firefox/Safari)

# 0.7.2

* `ractive.runtime.js` works again (sorry everyone!) (#1860)
* Methods that clash with non-function config properties trigger a warning (#1857)
* Using `intro-outro` on a component triggers the same warning as `intro` or `outro` by themselves (#1866)
* Fix for bug caused by broken `Array.prototype.map` polyfill in old versions of Prototype.js (#1872)
* Observers are cancelled when their instance is torn down (#1865)
* Prevent internal logging function from failing in certain edge cases (#1890)

# 0.7.1

* Fix version snafu

# 0.7.0

* Breaking changes
	* `ractive.data` is no longer exposed. Use `ractive.get()` and `ractive.set()` rather than accessing `data` directly
	* When instantiating or extending components, `data` properties on the instance/child component always override parent data

* Deprecated features
	* `ractive.debug` is replaced with a global `Ractive.DEBUG` flag (see below)
	* Inline partial definition comments (`<!-- {{>myPartial}} -->...`) should be replaced with inline partial sections (see below)
	* `options.data` should, if supplied, be a plain old JavaScript object (non-POJOs) or a function that returns one. Non-POJOs and arrays should only exist as *properties* of `options.data`

* New properties
	* `ractive.parent` - reference to parent component
	* `ractive.container` - reference to container component (e.g. in `<x><y/></x>`, `x === y.container`)
	* `ractive.root` - reference to a component's top level parent (i.e. created with `new Ractive()`)

* New methods
	* `ractive.findParent(name)` - finds the nearest parent component matching `name`
	* `ractive.findContainer(name)` - finds the nearest container component matching `name`
	* `ractive.resetPartial('name', template)` - updates all instances of `{{>name}}`
	* `ractive.toHtml()` is an alias for `ractive.toHTML()`
	* `ractive.once()` and `ractive.observeOnce()` are self-cancelling versions of `ractive.on()` and `ractive.observe()`
	* `Ractive.getNodeInfo(node)` returns information about `node`'s owner and the context in which it lives


* Other features
	* Rearchitecture of inter-component mappings, resulting in much faster updates.
	* `Ractive.DEBUG` flag controls whether warnings for non-fatal errors are printed to the console
	* `console` can be accessed inside template expressions (e.g. `{{console.log(this)}}`), for debugging
	* `elseif` in templates: `{{#if something}}...{{elseif otherthing}}...{{/if}}`
	* Element-level `twoway` directive for granular control over two-way binding
	* Element-level `lazy` directive, e.g. `lazy=true` or `lazy=250` to prevent or throttle data updates from user input
	* Inline partial section definitions (`{{#partial myPartial}}...{{/partial}}`). As well as defining partials within a template, they are used with named yields inside components (see next). Partial definitions must exist at the top level of a template, or as an immediate child of an element/component
	* `ractive.set()` can be used to set multiple 'wildcard' keypaths simultaneously
	* `ractive.toggle(wildcardKeypath)` toggles all keypaths matching `wildcardKeypath` individually. Ditto `ractive.add()` and `ractive.subtract()`
	* Better parse errors for malformed templates
	* Sourcemaps

* Bug fixes - too many to list...


# 0.6.1

* Breaking changes
	* If `obj` has no keys, then the `else` half of `{{#each obj}}...{{else}}...{{/each}}` will render
* Other changes
	* `this.event` available in method calls
	* Deprecation warnings are printed regardless of whether `debug` is true
	* HTML entity decoding is done at parse time, not render time
	* Special `@keypath` reference resolves to the current context
	* `@index`, `@key` and `@keypath` references are resolved at render time, not parse time (fixes #1303)
	* Centralised reference resolution logic
	* `console` is a supported global in expression - e.g. `{{console.log('debugging',foo)}}`
* Fixes for #1046, #1175, #1190, #1209, #1255, #1273, #1278, #1285, #1293, #1295, #1303, #1305, #1313, #1314, #1320, #1322, #1326, #1337, #1340, #1346, #1357, #1360, #1364, #1365, #1369, #1373, #1383, #1390, #1393, #1395, and #1399

# 0.6.0

* Breaking changes:
	* `new Ractive()` now inherits all options as methods/properties including event hooks.
	* The deprecated `init()` function (see below) is mapped to `onrender()` and will fire more than once, and no longer contains options argument
	* New reserved events (see below)
	* Setting uninitialised data on a component will no longer cause it to leak out into the parent scope
	* 'Smart updates', via `ractive.merge()` and `ractive.shift()` etc, work across component boundaries
* Deprecated:
	* `beforeInit()`, `init()`, and `complete()` - replaced with `onconstruct()`, `onrender()` and `oncomplete()` methods
* New features
	* Event hooks: `onconstruct()`, `onconfig()`, `oninit()`, `onrender()`, `oncomplete()`, `onunrender()`, `onteardown()`. These all have equivalent events, e.g. `this.on('render',...)`, which are reserved (i.e. you cannot use them as proxy events in templates)
	* Conditional attributes, e.g. `<div {{#if selected}}class='selected'{{/if}}>...</div>`
	* Safe to specify touch events for browsers that do not support them
	* Added support for `{{else}}` in `{{#with}}` block
	* Added support for `{{#each...}}...{{else}}...{{/each}}` with empty objects (#1299)
	* Within event handlers, the `event` object is available as `this.event`, and has a `name` property (useful alongside `ractive.on('*',...)`).
	* Character position is include alongside line and column information when parsing with `includeLinePositions: true`
	* Computed values and expressions are more efficient, and will not recompute unnecessarily
* Fixes for #868, #871, #1046, #1184, #1206, #1208, #1209, #1220, #1228, #1232, #1239, #1275, #1278, #1294, #1295, #1305, #1313, #1314, #1320 plus a few IE8 bugs

# 0.5.8

* Huge parser speed boost (see #1227)
* Fixes for #1204, #1214, #1218, #1221, #1223
* Partial names can be specified dynamically as references or expressions

# 0.5.7

* Release script got pooched; there was a tag mix-up of some sort with npm and 0.5.6 contained source files but not all the build files.
* Fixes for #1166, #1169, #1174, and #1183

# 0.5.6

* Breaking changes:
	* Use of other elements besides `<script>` for templates is an error
	* Removed CSS length interpolator
* New features
	* `{{yield}}` operator - see https://github.com/ractivejs/ractive/pull/1141
	* Event bubbling - see https://github.com/ractivejs/ractive/pull/1117
	* Method calls from templates - see https://github.com/ractivejs/ractive/pull/1146
	* Parse errors contain `line` and `character` data for debugging inside live editors
	* Partials have an optional context, e.g. `{{>item foo}}`
* Fixes for #618, #837, #983, #990, #995, #996, #1003, #1007, #1009, #1011, #1014, #1019, #1024, #1033, #1035, #1036, #1038, #1055, #1053, #1057, #1072, #1074, #1078, #1079, #1082, #1094, #1104, #1106, #1109, #1121, #1124, #1128, #1133, #1134, #1137, #1147, #1149, #1155, #1157
* Other changes
	* Initial changes from `ractive.animate()` are applied immediately, not on the next frame

# 0.5.5

* Breaking changes:
	* Removed debug option from `ractive.observe()` (#970)
* Fixes for #713, #941, #942, #943, #945, #950, #951, #952, #953, #960, #965, #967 and #974

# 0.5.2, 0.5.3, 0.5.4

* No actual changes, just wrestling with npm and bower!

# 0.5.1

* Fix for #939

# 0.5.0

* Code organisation
	* Codebase is now structured as ES6 modules, which can use new ES6 features such as arrow functions
	* Simpler, more efficient runloop
	* Encapsulated viewmodel logic

* Breaking changes:
	* errors in observers and evaluators are no longer caught
	* Nodes are detached as soon as any outro transitions are complete (if any), rather than when *all* transitions are complete
	* The options argument of `init: function(options)` is now strictly what was passed into the constructor, use `this.option` to access configured value.
	* `data` with properties on prototype are no longer cloned when accessed. `data` from "baseClass" is no longer deconstructed and copied.
	* Use of a `<script>` tag for specifying inline templates is not enforced.
	* Options specified on component constructors will not be picked up as defaults. `debug` now on `defaults`, not constructor
	* Select bindings follow general browser rules for choosing options. Disabled options have no value.
	* Input values are not coerced to numbers, unless input type is `number` or `range`
	* `{{this.foo}}` in templates now means same thing as `{{.foo}}`
	* Rendering to an element already render by Ractive causes that element to be torn down (unless appending).
	* Illegal javascript no longer allowed by parser in expressions and will throw
	* Parsed template format changed to specify template spec version.
		* Proxy-event representation
		* Non-dynamic (bound) fragments of html are no longer stored as single string
		* See https://github.com/ractivejs/template-spec for current spec.
	* Arrays being observed via `array.*` no longer send `item.length` event on mutation changes
	* Reserved event names in templates ('change', 'reset', 'teardown', 'update') will cause the parser to throw an error
	* `{{else}}` support in both handlebars-style blocks and regular mustache conditional blocks, but is now a restricted keyword that cannot be used as a regular reference
	* Child components are created in data order
	* Keypath expressions resolve left to right and follow same logic as regular mustache references (bind to root, not context, if left-most part is unresolved).
	* Improved attribute parsing and handling:
		* character escaping and whitespace handling in attribute directive arguments
		* boolean and empty string attributes

* Other new features
	* Better errors and debugging info
		* Duplicate, repetitive console.warn messages are not repeated.
		* Improved error handling and line numbers for parsing
		* Warn on bad two-way radio bindings
    * Support for handlebars style blocks: `#if`, `#with`, `#each`, `#unless` and corresponding `@index` and `@key`
	* Array mutation methods are now also available as methods on `Ractive.prototype` - e.g. `ractive.push('items', newItem)`. The return value is a Promise that fulfils when any transitions complete
	* Support for static mustache delimiters that do one-time binding
	* `{{./foo}}` added as alias for `{{.foo}}`
	* Leading `~/` keypath specifier, eg `{{~/foo}}`, for accessing root data context in keypaths
	* Observers with wildcards now receive actual wildcard values as additional arguments
	* The following plugins: adaptors, components, decorators, easing, events, interpolators, partials, transitions, when used in components will be looked up in the view hierarchy if they cannot be found in the inheritance chain.
	* `ractive.set` supports pattern observers, eg `ractive.set('foo.*.bar')`
	* Support for specifying multiple events in single `on`, eg `ractive.on( 'foo bar baz', handleFooBarOrBaz )`
	* Unnecessary leading and trailing whitespace in templates is removed
	* Better support for post-init render/insert
	* Computed properties can be updated with `ractive.update(property)`
	* `updateModel` returns a `Promise`
	* Media queries work correctly in encapsulated component CSS
	* `Component.extend` is writable (can be extended)
	* `append` option can now take a target element, behavior same as `ractive.insert`
	* All configuration options, except plugin registries, can be specified on `Ractive.defaults` and `Component.defaults`
	* Any configuration option except registries and computed properties can be specfied using a function that returns a value
	* `ractive.reset()` will re-render if template or partial specified by a function changes its value
	* New `ractive.resetTemplate()` method that re-renders with new template
	* Value of key/value pair for partials and components can be specified using a function
	* `ractive.off()` returns instance making it chainable
	* Improved support for extending Components with Components

* Bug fixes:
    * Component names not restricted by array method name conflicts
    * Ensure all change operations update DOM synchronously
    * Unrooted and unresolved keypath expression work correctly
    * Uppercase tag names bind correctly
    * Falsey values in directives (`0`,`''`, `false`, etc)
    * IE8 fixes and working test suite
    * Keypath expressions in binding attributes
    * Edge case for keypath expression that include regular expression
    * Input blur correctly updates model AND view
    * Component parameters data correctly sync with parents
    * Correct components.json format
    * Variety of edge cases with rebindings caused by array mutations
    * Partials aware of parent context
    * `foreignObject` correctly defaults to HTML namespace
    * Edge cases with bind, rebind, unrender in Triples
    * Sections (blocks) in attributes
    * Remove unncessary evaluator function calls
    * Incorrect "Computed properties without setters are read-only in the current version" error
    * Handle emulated touch events for nodes that are defined on `window` in the browser
    * Never initialiased decorators being torndown
    * File inputs without mustache refs are not bound
    * Pattern observers with empty array
    * Callbacks that throw cause promise reject
    * Clean-up `input` and `option` binding edge cases
    * Using `this._super` safe if baseclass or it's method doesn't actually exist.
    * Leading `.` on keypaths do not throw errors and are removed for purposes of processing
    * Post-blur validation via observer works correctly
    * Radio buttons with static attributes work correctly
    * DOCTYPE declarations are uppercased
    * Transitioned elements not detaching if window is not active
    * CSS transitions apply correctly
    * wildcard `*` can be used as first part of observer keypath

# 0.4.0

* BREAKING: Filenames are now lowercase. May affect you if you use Browserify etc.
* BREAKING: `set()`, `update()`, `teardown()`, `animate()`, `merge()`, `add()`, `subtract()`, and `toggle()` methods return a Promise that fulfils asynchronously when any resulting transitions have completed
* BREAKING: Elements are detached when *all* transitions are complete for a given instance, not just transitions on descendant nodes
* BREAKING: Default options are placed on `Ractive.defaults` (and `Component.defaults`, where `Component = Ractive.extend(...)`)
* BREAKING: The `adaptors` option is now `adapt`. It can be a string rather than an array if you're only using one adaptor
* Reactive computed properties
* Two-way binding works with 'keypath expressions' such as `{{foo[bar]}}`
* Support for single-file component imports via loader plugins such as http://ractivejs.github.io/ractive-load/
* A global runloop handles change propagation and other batchable operations, resulting in performance improvements across the board
* Promises are used internally, and exposed as `Ractive.Promise` (Promises/A+ compliant, a la ES6 Promises)
* Components can have encapsulated styles, passed in as the `css` option (disable with `noCssTransform: true`)
* `ractive.reset()` method allows you to replace an instance's `data` object
* Decorators are updated when their arguments change (with specified `update()` method if possible, otherwise by tearing down and reinitialising)
* Inline components inherit surrounding data context, unless defined with `isolated: true`
* Transitions will use JavaScript timers if CSS transitions are unavailable
* A global variable (`window.Ractive`) is always exported, but `Ractive.noConflict()` is provided to prevent clobbering existing `Ractive` variable
* Inline component `init()` methods are only called once the component has entered the DOM
* Any section can be closed with `{{/...}}`, where `...` can be any string other than the closing delimiter
* Evaluators that throw exceptions will print an error to the console in debug mode
* `ractive.observe(callback)` - i.e. with no keypath - observes everything
* `ractive.observe('foo bar baz', callback)` will observe all three keypaths (passed to callback as third argument)
* Better whitespace preservation and indenting when using `ractive.toHTML()`
* Calling `ractive.off()` with no arguments removes all event listeners
* Triples work inside SVG elements
* `<option>{{foo}}</option>` works the same as `<option value='{{foo}}'>{{foo}}</option>`
* More robust data/event propagation between components
* More robust magic mode
* Fixed a host of edge case bugs relating to array mutations
* Many minor fixes and tweaks: #349, #351, #353, #369, #370, #376, #377, #390, #391, #393, #398, #401, #406, #412, #425, #433, #434, #439, #441, #442, #446, #451, #460, #462, #464, #465, #467, #479, #480, #483, #486, #520, #530, #536, #553, #556

# 0.3.9

* `ractive.findComponent()` and `ractive.findAllComponents()` methods, for getting references to components
* Expression results are wrapped if necessary (e.g. `{{getJSON(url)}}` wrapped by [@lluchs](https://github.com/lluchs)' [Promise adaptor](lluchs.github.io/Ractive-adaptors-Promise/))
* Mustaches referring to wrapped values render the facade, not the value
* Directive arguments are parsed more reliably
* Components inherit adaptors from their parents
* Adapto
* Changes to [transitions API](http://docs.ractivejs.org/latest/transitions)
* SVG support is detected and exposed as `Ractive.svg`
* If subclass has data, it is used as prototype for instance data

# 0.3.8

* Reorganised project into AMD modules, using [amdclean](https://github.com/gfranko/amdclean) during build
* [Decorators](http://docs.ractivejs.org/latest/decorators) - decorate elements with functionality, e.g. tooltips, jQuery UI widgets, etc
* Moved plugins (adaptors, decorators, custom events, transitions) out of the main codebase and into [separate repositories](https://github.com/RactiveJS/Ractive/wiki/Plugins). Note: [plugin APIs](http://docs.ractivejs.org/latest/plugin-apis) have changed!
* [`ractive.merge()`](http://docs.ractivejs.org/latest/ractive-merge) - merge items from one array into another (e.g. updating with data from a server)
* Pattern observers - observe e.g. `items[*].status`
* Contenteditable support (thanks [@aphitiel](https://github.com/aphitiel) and [@Nijikokun](https://github.com/Nijikokun))
* `ractive.insert()` and `ractive.detach()` methods for moving a Ractive instance in and out of the DOM without destroying it
* `ractive.toHTML()` replaces `ractive.renderHTML()`
* `ractive.findAll( selector, { live: true })` maintains a live list of elements matching any CSS selector
* Various bugfixes

# 0.3.7

* [Adaptors](http://docs.ractivejs.org/latest/adaptors) - use external libraries like Backbone seamlessly with Ractive
* Dependency tracking within functions, by monitoring `ractive.get()`)
* Create live nodelists with the [`findAll()`](http://docs.ractivejs.org/latest/ractive-findall) method
* Observers are guaranteed to fire before DOM updates, unless `{defer:true}` is passed as an option to [`ractive.observe()`](http://docs.ractivejs.org/latest/ractive-observe)
* Triples behave correctly inside table elements etc (issue #167)
* Delimiters ('{{' and '}}') can be overridden globally with `Ractive.delimiters` and `Ractive.tripleDelimiters`
* Fix #130 (event handler parameters and array modification)
* Tap event respects spacebar keypresses while a suitable element is focused
* updateModel() method to resync two-way bindings if they are manipulated external (e.g. `$(input).val(newValue)`)
* Better handling of HTML entities
* Expressions with unresolved references will still render, using `undefined` in place of unknown references
* Hover event fires on the equivalent of mouseenter/mouseleave rather than mouseover/mouseout
* Various bugfixes and stability/performance improvements

# 0.3.6

* Better two-way binding - support for multiple checkboxes and file inputs
* Experimental 'magic mode' - use ES5 getters and setters instead of .set() and .get(). See [#110](https://github.com/RactiveJS/Ractive/issues/110)
* More efficient event binding, and dynamic proxy event names
* Support for pointer events with `tap` - thanks [lluchs](https://github.com/lluchs)
* Iterate through properties of an object - see [#115](https://github.com/RactiveJS/Ractive/issues/115)
* Bugfixes and refactoring

# 0.3.5

* Experimental support for components - see [this thread](https://github.com/RactiveJS/Ractive/issues/74) for details
* Support for [component](https://github.com/component/component) - thanks [CamShaft](https://github.com/CamShaft)
* Option to use `on-click` style event binding (as opposed to `proxy-click`)
* Bug fixes

# 0.3.4

* `ractive.find()` and `ractive.findAll()` convenience methods (equivalent to `ractive.el.querySelector()` and `ractive.el.querySelectorAll()`)
* Subclasses created with `Ractive.extend()` can now have a `beforeInit` method that will be called before rendering
* Expressions no longer need to be wrapped in parentheses. Section closing mustaches for expression sections can have any content
* Various minor bugfixes and improvements

# 0.3.3

* Maintenance and bugfixes

# 0.3.2

* IE8 support!

# 0.3.1

* Transitions - fine-grained control over how elements are rendered and torn down
* Inline partials
* ractive.observe() method
* Smart updates when using array mutator methods, reducing the amount of DOM manipulation that happens
* Changed proxy event and event definition API (BREAKING CHANGE!)
* Improved Ractive.extend
* SVG elements no longer require the xmlns='http://www.w3.org/2000/svg' attribute - it is assumed, as it is in browsers
* ractive.animate() can accept a map of keypaths to values
* fullscreen convenience methods
* removed ractive.render() method
* added ractive.renderHTML() method, for rendering template+data (in browser or server environment)

# 0.3.0

* Major overhaul, particularly of the parser
* Expressions - JS-like expressions within templates, with robust tracking of multiple dependencies. These replace formatters
* Renamed Ractive.compile -> Ractive.parse
* Added adaptors (e.g. Backbone Model adaptors)
* Various performance enhancements and bug fixes

# 0.2.2

* Added event proxies. In lieu of documentation, for now, see [#27](https://github.com/RactiveJS/Ractive/issues/27)
* Made array modification more robust and performant

# 0.2.1

* Cleaned up some redundant code following 0.2.0 overhaul, some minor performance benefits
* Linting and refactoring
* Fixed bug where Ractive would attempt to use innerHTML with non-HTML elements (i.e. SVG text)

# 0.2.0

* Major architectural overhaul. Data is now stored on the Ractive instance rather than on a separate viewmodel, allowing for cleaner and more efficient code (at the cost of the ability to share one viewmodel among many instances - a theoretical benefit at best). Data is flattened and cached, permitting lightning-fast lookups even with complex data.
* Templates can be sanitized at compile-time to remove script tags and other hypothetical security risks. In lieu of documentation see issue #12

# 0.1.9

* More complete compliance with mustache test suite
* More efficient compilation (consecutive text nodes are concatenated, etc)
* Cleaned up public API, internal functions now kept private
* `.animate()` now interpolates between arrays, and between objects
* Complex element attributes wait until the end of a `.set()` cycle to update, to avoid repeatedly modifying the DOM unnecessarily
* Element property names are used instead of attributes wherever possible (e.g. we use `node.className='...'` instead of `node.setAttribute('class','...')` internally)
* Various bug fixes

# 0.1.8

* Now using DOM fragments for better performance
* Better support for legacy browsers
* Vastly better two-way data binding
* set() and get() now accept arrays of keys, for edge cases involving keys with periods
* Bug fixes and refactoring

# 0.1.7

* Renamed project from Anglebars to Ractive
* Added support for animation
* A shed-load of bug fixes, and a big dollop of refactoring

# 0.1.6

* Bug fixes!
* Modify arrays so that `pop`, `push` and other mutator methods trigger a view update
* Removed half-finished, flaky async code. Async mode may return later
* `set` events are called when a) `view.set()` is called, b) twoway bindings trigger them, c) array mutator methods cause an update

# 0.1.5

* Split into Anglebars.compile and Anglebars.runtime, to shave a few kilobytes off in production
* Simplified API - removed `compiled` and `compiledPartials` init options (in favour of allowing either compiled or string templates), and removed `observe` and `unobserve` instance methods
* Added event methods - `on`, `off` and `fire`
* `Anglebars.extend` for creating subclasses with default options (e.g. templates) and additional methods
* Support passing in jQuery collections (and lookalikes), and CSS selectors (if browser supports `document.querySelector`)
* Index references - `{{#section:i}}<!-- {{i}} evaluates to array index inside here -->{{/section}}`

# 0.1.4

* started maintaining a changelog...
