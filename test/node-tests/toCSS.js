/*global require, describe, it */
const Ractive = require( '../../ractive' );
const assert = require( 'assert' );


describe( 'ractive.toCSS()', () => {

	it( 'should render CSS with a single component instance', () => {

		const Component = Ractive.extend( {
			template: `<div></div>`,
			css: `
			.green {
				color: green
			}
		`
		} );

		const app = new Component( {} );

		const cssId = Component.prototype.cssId;
		const css = app.toCSS();

		// Look for the selector
		assert( !!~css.indexOf( `.green[data-ractive-css~="{${cssId}}"], [data-ractive-css~="{${cssId}}"] .green`, `.green selector for ${cssId} should exist` ) );

		app.teardown();

	} );

	it( 'should render CSS with nested component instances', () => {

		const GrandChildComponent = Ractive.extend( {
			template: `<div></div>`,
			css: `
			.green {
				color: green;
			}
		`
		} );

		const ChildComponent = Ractive.extend( {
			template: `
			<div></div>
			<GrandChildComponent />
		`,
			css: `
			.red {
				color: red;
			}
		`,
			components: {
				GrandChildComponent
			}
		} );

		const ParentComponent = Ractive.extend( {
			template: `
			<div></div>
			<ChildComponent />
		`,
			css: `
			.blue{
				color: blue;
			}
		`,
			components: {
				ChildComponent
			}
		} );

		const app = new ParentComponent( {} );

		const css = app.toCSS();
		const grandChildCssId = GrandChildComponent.prototype.cssId;
		const childCssId = ChildComponent.prototype.cssId;
		const parentCssId = ParentComponent.prototype.cssId;

		// Look for the selectors
		assert( !!~css.indexOf( `.green[data-ractive-css~="{${grandChildCssId}}"], [data-ractive-css~="{${grandChildCssId}}"] .green` ), `.green selector for ${grandChildCssId} should exist` );

		assert( !!~css.indexOf( `.red[data-ractive-css~="{${childCssId}}"], [data-ractive-css~="{${childCssId}}"] .red` ), `.red selector for ${childCssId} should exist` );

		assert( !!~css.indexOf( `.blue[data-ractive-css~="{${parentCssId}}"], [data-ractive-css~="{${parentCssId}}"] .blue` ), `.blue selector for ${parentCssId} should exist` );

		app.teardown();

	} );

	it( 'should NEVER render CSS with a Ractive instance', () => {

		const app = new Ractive( {
			template: `<div></div>`,
			css: `
			.green {
				color: green
			}
		`
		} );

		const css = app.toCSS();

		assert( !~css.indexOf( `.green[data-ractive-css~="{${app.cssId}}"], [data-ractive-css~="{${app.cssId}}"] .green`, `.green selector for ${app.cssId} should NEVER exist` ) );

		app.teardown();

	} );


} );
