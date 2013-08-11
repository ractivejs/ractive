Changelog
---------

* 0.1.4
	* started maintaining a changelog...
* 0.1.5
	* Split into Anglebars.compile and Anglebars.runtime, to shave a few kilobytes off in production
	* Simplified API - removed `compiled` and `compiledPartials` init options (in favour of allowing either compiled or string templates), and removed `observe` and `unobserve` instance methods
	* Added event methods - `on`, `off` and `fire`
	* `Anglebars.extend` for creating subclasses with default options (e.g. templates) and additional methods
	* Support passing in jQuery collections (and lookalikes), and CSS selectors (if browser supports `document.querySelector`)
	* Index references - `{{#section:i}}<!-- {{i}} evaluates to array index inside here -->{{/section}}`
* 0.1.6
	* Bug fixes!
	* Modify arrays so that `pop`, `push` and other mutator methods trigger a view update
	* Removed half-finished, flaky async code. Async mode may return later
	* `set` events are called when a) `view.set()` is called, b) twoway bindings trigger them, c) array mutator methods cause an update
* 0.1.7
	* Renamed project from Anglebars to Ractive
	* Added support for animation
	* A shed-load of bug fixes, and a big dollop of refactoring
* 0.1.8
	* Now using DOM fragments for better performance
	* Better support for legacy browsers
	* Vastly better two-way data binding
	* set() and get() now accept arrays of keys, for edge cases involving keys with periods
	* Bug fixes and refactoring
* 0.1.9
	* More complete compliance with mustache test suite
	* More efficient compilation (consecutive text nodes are concatenated, etc)
	* Cleaned up public API, internal functions now kept private
	* `.animate()` now interpolates between arrays, and between objects
	* Complex element attributes wait until the end of a `.set()` cycle to update, to avoid repeatedly modifying the DOM unnecessarily
	* Element property names are used instead of attributes wherever possible (e.g. we use `node.className='...'` instead of `node.setAttribute('class','...')` internally)
	* Various bug fixes
* 0.2.0
	* Major architectural overhaul. Data is now stored on the Ractive instance rather than on a separate viewmodel, allowing for cleaner and more efficient code (at the cost of the ability to share one viewmodel among many instances - a theoretical benefit at best). Data is flattened and cached, permitting lightning-fast lookups even with complex data.
	* Templates can be sanitized at compile-time to remove script tags and other hypothetical security risks. In lieu of documentation see issue #12
* 0.2.1
	* Cleaned up some redundant code following 0.2.0 overhaul, some minor performance benefits
	* Linting and refactoring
	* Fixed bug where Ractive would attempt to use innerHTML with non-HTML elements (i.e. SVG text)
* 0.2.2
	* Added event proxies. In lieu of documentation, for now, see [#27](https://github.com/Rich-Harris/Ractive/issues/27)
	* Made array modification more robust and performant
* 0.3.0
	* Major overhaul, particularly of the parser
	* Expressions - JS-like expressions within templates, with robust tracking of multiple dependencies. These replace formatters
	* Renamed Ractive.compile -> Ractive.parse
	* Added adaptors (e.g. Backbone Model adaptors)
	* Various performance enhancements and bug fixes
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
* 0.3.2
	* IE8 support!
* 0.3.3
	* Maintenance and bugfixes
* 0.3.4
    * `ractive.find()` and `ractive.findAll()` convenience methods (equivalent to `ractive.el.querySelector()` and `ractive.el.querySelectorAll()`)
    * Subclasses created with `Ractive.extend()` can now have a `beforeInit` method that will be called before rendering
    * Expressions no longer need to be wrapped in parentheses. Section closing mustaches for expression sections can have any content
    * Various minor bugfixes and improvements
* 0.3.5
    * Experimental support for components - see [this thread](https://github.com/Rich-Harris/Ractive/issues/74) for details
    * Support for [component](https://github.com/component/component) - thanks [CamShaft](https://github.com/CamShaft)
    * Option to use `on-click` style event binding (as opposed to `proxy-click`)
    * Bug fixes