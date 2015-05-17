
No Adaptors (incudes array and magic, so ractive API only)
Pattern Observers on array indexes
.length property not being notified
ractive.merge()
Component Live Queries do not maintain order
Should computed shadowing data be allowed?

TODO: remove WITH_IF from parser as always non-renderable

Breaking Changes
	* Forced Resolution
		* binds to nearest context, not root
		* Doesn't happen until value set
	* {{#with}} block does not render on non-value

Failing Tests:
* componentData.js - 3 tests
	* magic mode, findAll query update, merge
* computations.js - 1 test
	* setting computed on init with shadow prop
* misc.js -
	* Bindings without explicit keypaths can survive a splice operation

	* .length needs to be triggered
		* Miscellaneous: Regression test for #271
		* Miscellaneous: Regression test for #316

* Miscellaneous: Two-way binding can be set up against expressions that resolve to regular keypaths
* Miscellaneous: Regression test for #460


* partials: partial functions selects same partial until reset
* partials: Named partials should not get rebound if they happen to have the same name as a reference
* Radio name inputs respond to model changes (regression, see #783)
* Two-way bindings: Changes made in oninit are reflected on render (#1390)

