/*global require, describe, it */
let Ractive = require('../../ractive');
let assert = require('assert');

describe('ractive.toCSS()', () => {

	it('should be able to return CSS for a single component', () => {

		let Component = Ractive.extend({
			template: `
				<div class="child-component">
					<p>This is also red</p>
					<p class="green">This should be green</p>
				</div>
			`,
			css: `
				.green {
					color: green
				}
			`
		});

		let app = new Component({
			el: fixture
		});

		let css = app.toCSS();

		// Look for the selector
		assert(!!~css.indexOf('.green[data-ractive-css~="{1}"], [data-ractive-css~="{1}"] .green'));

		app.teardown();

	});

	it('should be able to return CSS for nested components', () => {

		let ChildComponent = Ractive.extend({
			template: `
				<div class="child-component">
					<p>This is also red</p>
					<p class="green">This should be green</p>
				</div>
			`,
			css: `
				.green {
					color: green
				}
			`
		});

		let ParentComponent = Ractive.extend({
			template: `
				<div class="parent-component">
					<p>This should be red</p>
					<p class="blue">This should be blue</p>
					<ChildComponent />
				</div>
			`,
			css: `
				.parent-component{
					color: red;
				}
				.blue{
					color: blue;
				}
			`,
			components: {
				ChildComponent
			}
		});

		let app = new ParentComponent();
		let css = app.toCSS();

		// Look for the selectors
		assert(!!~css.indexOf('.green[data-ractive-css~="{1}"], [data-ractive-css~="{1}"] .green'));
		assert(!!~css.indexOf('.parent-component[data-ractive-css~="{2}"], [data-ractive-css~="{2}"] .parent-component'));
		assert(!!~css.indexOf('.blue[data-ractive-css~="{2}"], [data-ractive-css~="{2}"] .blue'));

		app.teardown();

	});

});
