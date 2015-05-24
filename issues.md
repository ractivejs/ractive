
No Adaptors (incudes array and magic, so ractive API only)
ractive.merge()
Component Live Queries do not maintain order
Should computed shadowing data be allowed?

TODO: remove WITH_IF from parser as always non-renderable

Breaking Changes
	* Forced Resolution
		* binds to nearest context, not root
		* Doesn't happen until value set
	* {{#with}} block does not render on non-value
	* observeList replaces array muations in patter observers

Failing Tests (beyond adaptor and pattern observe):
* componentData.js - 3 tests
	* magic mode, findAll query update, merge
* computations.js - 1 test
	* setting computed on init with shadow prop
* misc.js -
	* Bindings without explicit keypaths can survive a splice operation
	* 2 adaptor tests
	* .length needs to be triggered
		* Miscellaneous: Regression test for #316
	* 2 magic tests
	* Two-way binding can be set up against expressions that resolve to regular keypaths
	* Regression test for #460
	* set with keypath pattern
		* Keypaths in ractive.set() can contain wildcards (#784)
		* multiple pattern keypaths can be set simultaneously (#1319)

* twoway.js - 2 tests
	* Radio name inputs respond to model changes (regression, see #783)
	* Two-way bindings: Changes made in oninit are reflected on render (#1390)
	* 2 false fails (pass when run independently)
	* 1 ambigous ref change

