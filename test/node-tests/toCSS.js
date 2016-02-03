/*global require, describe, it */
const Ractive = require( '../../ractive' );
const assert = require( 'assert' );

describe( 'ractive.toCSS()', () => {

	it( 'should be able to return CSS for a single component', () => {

		const Component = Ractive.extend( {
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
		} );

		const app = new Component( {
			el: fixture
		} );

		const css = app.toCSS();

		// Look for the selector
		assert( ~css.indexOf( `.green[data-ractive-css~="{${app.cssId}}"], [data-ractive-css~="{${app.cssId}}"] .green` ) );

		app.teardown();

	} );

	it( 'should be able to return CSS for nested components', () => {

		const ChildComponent = Ractive.extend( {
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
		} );

		const ParentComponent = Ractive.extend( {
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
		} );

		const app = new ParentComponent();

		const css = app.toCSS();
		const parentCssId = ParentComponent.prototype.cssId;
		const childCssId = ChildComponent.prototype.cssId;

		// Look for the selectors
		assert( ~css.indexOf( `.green[data-ractive-css~="{${childCssId}}"], [data-ractive-css~="{${childCssId}}"] .green` ) );
		assert( ~css.indexOf( `.parent-component[data-ractive-css~="{${parentCssId}}"], [data-ractive-css~="{${parentCssId}}"] .parent-component` ) );
		assert( ~css.indexOf( `.blue[data-ractive-css~="{${parentCssId}}"], [data-ractive-css~="{${parentCssId}}"] .blue` ) );

		app.teardown();

	} );

} );
