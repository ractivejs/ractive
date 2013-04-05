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