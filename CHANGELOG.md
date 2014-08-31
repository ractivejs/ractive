Changelog
---------
* next
    * Breaking changes:
        * Use of other elements besides `<script>` for templates is an error

* 0.5.5
	* Fixes for #713, #941, #942, #943, #945, #950, #951, #952, #953, #960, #965, #967 and #974
* 0.5.2, 0.5.3, 0.5.4
	* No actual changes, just wrestling with npm and bower!
* 0.5.1
	* Fix for #939
* 0.5.0
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

* 0.4.0
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
* 0.3.9
    * `ractive.findComponent()` and `ractive.findAllComponents()` methods, for getting references to components
	* Expression results are wrapped if necessary (e.g. `{{getJSON(url)}}` wrapped by [@lluchs](https://github.com/lluchs)' [Promise adaptor](lluchs.github.io/Ractive-adaptors-Promise/))
    * Mustaches referring to wrapped values render the facade, not the value
    * Directive arguments are parsed more reliably
    * Components inherit adaptors from their parents
    * Adapto
    * Changes to [transitions API](http://docs.ractivejs.org/latest/transitions)
    * SVG support is detected and exposed as `Ractive.svg`
	* If subclass has data, it is used as prototype for instance data
* 0.3.8
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
* 0.3.7
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
* 0.3.6
    * Better two-way binding - support for multiple checkboxes and file inputs
    * Experimental 'magic mode' - use ES5 getters and setters instead of .set() and .get(). See [#110](https://github.com/RactiveJS/Ractive/issues/110)
    * More efficient event binding, and dynamic proxy event names
    * Support for pointer events with `tap` - thanks [lluchs](https://github.com/lluchs)
    * Iterate through properties of an object - see [#115](https://github.com/RactiveJS/Ractive/issues/115)
    * Bugfixes and refactoring
* 0.3.5
    * Experimental support for components - see [this thread](https://github.com/RactiveJS/Ractive/issues/74) for details
    * Support for [component](https://github.com/component/component) - thanks [CamShaft](https://github.com/CamShaft)
    * Option to use `on-click` style event binding (as opposed to `proxy-click`)
    * Bug fixes
* 0.3.4
    * `ractive.find()` and `ractive.findAll()` convenience methods (equivalent to `ractive.el.querySelector()` and `ractive.el.querySelectorAll()`)
    * Subclasses created with `Ractive.extend()` can now have a `beforeInit` method that will be called before rendering
    * Expressions no longer need to be wrapped in parentheses. Section closing mustaches for expression sections can have any content
    * Various minor bugfixes and improvements
* 0.3.3
	* Maintenance and bugfixes
* 0.3.2
	* IE8 support!
* 0.3.1
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
* 0.3.0
	* Major overhaul, particularly of the parser
	* Expressions - JS-like expressions within templates, with robust tracking of multiple dependencies. These replace formatters
	* Renamed Ractive.compile -> Ractive.parse
	* Added adaptors (e.g. Backbone Model adaptors)
	* Various performance enhancements and bug fixes
* 0.2.2
	* Added event proxies. In lieu of documentation, for now, see [#27](https://github.com/RactiveJS/Ractive/issues/27)
	* Made array modification more robust and performant
* 0.2.1
	* Cleaned up some redundant code following 0.2.0 overhaul, some minor performance benefits
	* Linting and refactoring
	* Fixed bug where Ractive would attempt to use innerHTML with non-HTML elements (i.e. SVG text)
* 0.2.0
	* Major architectural overhaul. Data is now stored on the Ractive instance rather than on a separate viewmodel, allowing for cleaner and more efficient code (at the cost of the ability to share one viewmodel among many instances - a theoretical benefit at best). Data is flattened and cached, permitting lightning-fast lookups even with complex data.
	* Templates can be sanitized at compile-time to remove script tags and other hypothetical security risks. In lieu of documentation see issue #12
* 0.1.9
	* More complete compliance with mustache test suite
	* More efficient compilation (consecutive text nodes are concatenated, etc)
	* Cleaned up public API, internal functions now kept private
	* `.animate()` now interpolates between arrays, and between objects
	* Complex element attributes wait until the end of a `.set()` cycle to update, to avoid repeatedly modifying the DOM unnecessarily
	* Element property names are used instead of attributes wherever possible (e.g. we use `node.className='...'` instead of `node.setAttribute('class','...')` internally)
	* Various bug fixes
* 0.1.8
	* Now using DOM fragments for better performance
	* Better support for legacy browsers
	* Vastly better two-way data binding
	* set() and get() now accept arrays of keys, for edge cases involving keys with periods
	* Bug fixes and refactoring
* 0.1.7
	* Renamed project from Anglebars to Ractive
	* Added support for animation
	* A shed-load of bug fixes, and a big dollop of refactoring
* 0.1.6
	* Bug fixes!
	* Modify arrays so that `pop`, `push` and other mutator methods trigger a view update
	* Removed half-finished, flaky async code. Async mode may return later
	* `set` events are called when a) `view.set()` is called, b) twoway bindings trigger them, c) array mutator methods cause an update
* 0.1.5
	* Split into Anglebars.compile and Anglebars.runtime, to shave a few kilobytes off in production
	* Simplified API - removed `compiled` and `compiledPartials` init options (in favour of allowing either compiled or string templates), and removed `observe` and `unobserve` instance methods
	* Added event methods - `on`, `off` and `fire`
	* `Anglebars.extend` for creating subclasses with default options (e.g. templates) and additional methods
	* Support passing in jQuery collections (and lookalikes), and CSS selectors (if browser supports `document.querySelector`)
	* Index references - `{{#section:i}}<!-- {{i}} evaluates to array index inside here -->{{/section}}`
* 0.1.4
	* started maintaining a changelog...
