
No Adaptors (incudes array and magic, so ractive API only)
No Pattern Observers
No binding to .length property
Mostly No .merge()
Component Live Queries do not maintain order
A few edge cases around Computed Properties and Components

Breaking Changes
	* Forced Resolution binds to nearest context, not root

Failing Tests:
* componentData.js - 3 tests
	* magic mode, findAll query update, merge
* get(): Returns mappings on root .get()
* Miscellaneous: Subclasses of subclasses inherit data, partials and transitions
* Miscellaneous: Multiple identical evaluators merge
* Miscellaneous: .unshift() works with proxy event handlers, without index references
* Miscellaneous: Bindings without explicit keypaths can survive a splice operation
* Inverted sections aren't broken by unshift operations
* Splice operations that try to remove more items than there are from an array are handled
* Miscellaneous: Regression test for #271
* Miscellaneous: Regression test for #297
* Miscellaneous: Two-way binding can be set up against expressions that resolve to regular keypaths
* Miscellaneous: Regression test for #460
* partials: partial functions selects same partial until reset
* partials: Named partials should not get rebound if they happen to have the same name as a reference
* Radio name inputs respond to model changes (regression, see #783)
* Two-way bindings: Changes made in oninit are reflected on render (#1390)

