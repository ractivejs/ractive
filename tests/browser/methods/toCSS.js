import { initModule } from '../../helpers/test-config';
import { createIsolatedEnv } from '../../helpers/Environment';
import QUnit, { test } from 'qunit';

export default function() {
	initModule( 'methods/toCSS.js' );

	function createComponentDefinition( Ractive ) {

		return Ractive.extend( {
			template: `<div></div>`,
			css: `
				.green {
					color: green
				}
			`,
			isolated: false
		} );

	}

	test( 'toCSS with a single component instance', t => {

		const Component = Ractive.extend( {
			template: `<div></div>`,
			css: `
				.green {
					color: green
				}
			`
		} );

		const app = new Component( {
			el: fixture
		} );

		const cssId = Component.prototype.cssId;
		const css = app.toCSS();

		// Look for the selector
		t.ok( !!~css.indexOf( `.green[data-ractive-css~="{${cssId}}"], [data-ractive-css~="{${cssId}}"] .green`, `.green selector for ${cssId} should exist` ) );

		app.teardown();

	} );

	test( 'toCSS with nested component instances', t => {

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

		const app = new ParentComponent( {
			el: fixture
		} );

		const css = app.toCSS();
		const grandChildCssId = GrandChildComponent.prototype.cssId;
		const childCssId = ChildComponent.prototype.cssId;
		const parentCssId = ParentComponent.prototype.cssId;

		// Look for the selectors
		t.ok( !!~css.indexOf( `.green[data-ractive-css~="{${grandChildCssId}}"], [data-ractive-css~="{${grandChildCssId}}"] .green` ), `.green selector for ${grandChildCssId} should exist` );

		t.ok( !!~css.indexOf( `.red[data-ractive-css~="{${childCssId}}"], [data-ractive-css~="{${childCssId}}"] .red` ), `.red selector for ${childCssId} should exist` );

		t.ok( !!~css.indexOf( `.blue[data-ractive-css~="{${parentCssId}}"], [data-ractive-css~="{${parentCssId}}"] .blue` ), `.blue selector for ${parentCssId} should exist` );

		app.teardown();

	} );

	if (!window.__karma__) {
		test( 'toCSS with components constructed from Ractive of different environments', t => {
			t.expect( 5 );

			// this test takes a while sometimes
			const timeout = QUnit.config.testTimeout;
			QUnit.config.testTimeout = 30000;
			setTimeout(() => {
				QUnit.config.testTimeout = timeout;
			}, 10);

			const done1 = t.async();
			const done2 = t.async();
			const done3 = t.async();
			const done4 = t.async();
			const done5 = t.async();

		// Simulate two separate Ractive environments using iframes
			Promise.all( [ createIsolatedEnv(), createIsolatedEnv() ] ).then( envs => {

				const ComponentA = createComponentDefinition( envs[ 0 ].Ractive );
				const ComponentB = createComponentDefinition( envs[ 1 ].Ractive );

				const cssIdA = ComponentA.prototype.cssId;
				const cssIdB = ComponentB.prototype.cssId;

				const instanceA = new ComponentA( {
					el: envs[ 0 ].body
				} );
				const instanceB = new ComponentB( {
					el: envs[ 1 ].body
				} );

				const cssA = instanceA.toCSS();
				const cssB = instanceB.toCSS();

				t.notEqual( cssIdA, cssIdB, `Two top-level components from different environments should not have the same ID` );
				done1();

				t.ok( !!~cssA.indexOf( `.green[data-ractive-css~="{${cssIdA}}"], [data-ractive-css~="{${cssIdA}}"] .green` ), `.green selector for ${cssIdA} should exist on instance A` );
				done2();

				t.ok( !~cssA.indexOf( `.green[data-ractive-css~="{${cssIdB}}"], [data-ractive-css~="{${cssIdB}}"] .green` ), `.green selector for ${cssIdB} should NEVER exist on instance A` );
				done3();

				t.ok( !!~cssB.indexOf( `.green[data-ractive-css~="{${cssIdB}}"], [data-ractive-css~="{${cssIdB}}"] .green` ), `.green selector for ${cssIdB} should exist on instance B` );
				done4();

				t.ok( !~cssB.indexOf( `.green[data-ractive-css~="{${cssIdA}}"], [data-ractive-css~="{${cssIdA}}"] .green` ), `.green selector for ${cssIdA} should NEVER exist on instance B` );
				done5();

				instanceA.teardown();
				instanceB.teardown();
				envs[ 0 ].env.remove();
				envs[ 1 ].env.remove();

			} );

		} );
	}

	test( 'toCSS with a Ractive instance', t => {

		const app = new Ractive( {
			el: fixture,
			template: `<div></div>`,
			css: `
				.green {
					color: green
				}
			`
		} );

		const css = app.toCSS();

		t.ok( !~css.indexOf( `.green[data-ractive-css~="{${app.cssId}}"], [data-ractive-css~="{${app.cssId}}"] .green`, `.green selector for ${app.cssId} should NEVER exist` ) );

		app.teardown();

	} );
}
