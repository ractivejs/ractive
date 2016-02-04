import { test }
from 'qunit';

test( 'toCSS with a single component', t => {

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
	t.ok( ~css.indexOf( `.green[data-ractive-css~="{${app.cssId}}"], [data-ractive-css~="{${app.cssId}}"] .green`, `.green selector for ${app.cssId} should exist` ) );

	app.teardown();

} );

test( 'toCSS with a nested component', t => {

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

	const app = new ParentComponent( {
		el: fixture
	} );

	const css = app.toCSS();
	const parentCssId = ParentComponent.prototype.cssId;
	const childCssId = ChildComponent.prototype.cssId;

	// Look for the selectors
	t.ok( ~css.indexOf( `.green[data-ractive-css~="{${childCssId}}"], [data-ractive-css~="{${childCssId}}"] .green` ), `.green selector for ${childCssId} should exist` );
	t.ok( ~css.indexOf( `.parent-component[data-ractive-css~="{${parentCssId}}"], [data-ractive-css~="{${parentCssId}}"] .parent-component` ), `.parent-component selector for ${parentCssId} should exist` );
	t.ok( ~css.indexOf( `.blue[data-ractive-css~="{${parentCssId}}"], [data-ractive-css~="{${parentCssId}}"] .blue` ), `.blue selector for ${parentCssId} should exist` );

	app.teardown();

} );



test( 'toCSS from separate Ractive instances', t => {
	t.expect( 3 );

	const done1 = t.async();
	const done2 = t.async();
	const done3 = t.async();

	function createIsolatedEnv() {

		return new Ractive.Promise( ( resolve, reject ) => {

			const frame = document.createElement( 'iframe' );
			document.body.appendChild( frame );

			frame.style.width = '0';
			frame.style.height = '0';

			const win = frame.contentWindow || frame;
			const doc = frame.contentDocument || frame.contentWindow.document;

			const script = document.createElement( 'script' );
			doc.body.appendChild( script );

			script.onload = () => {
				resolve( {
					Ractive: win.Ractive,
					env: frame,
					body: doc.body
				} );
			};
			script.onerror = () => {
				reject();
			};

			script.src = '../ractive-legacy.js';

		} );

	}

	function createComponentDefinition( Ractive ) {

		return Ractive.extend( {
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

	}

	// Simulate two separate Ractive environments using iframes
	Ractive.Promise.all( [ createIsolatedEnv(), createIsolatedEnv() ] ).then( envs => {

		const ComponentA = createComponentDefinition( envs[ 0 ].Ractive );
		const ComponentB = createComponentDefinition( envs[ 1 ].Ractive );

		const cssIdA = ComponentA.prototype.cssId;
		const cssIdB = ComponentB.prototype.cssId;

		const instanceA = new ComponentA( {	el: envs[ 0 ].body } );
		const instanceB = new ComponentB( {	el: envs[ 1 ].body } );

		const cssA = instanceA.toCSS();
		const cssB = instanceB.toCSS();

		t.notEqual( cssIdA, cssIdB, `Two top-level components from different environments should not have the same ID` );
		done1();

		t.ok( ~cssA.indexOf( `.green[data-ractive-css~="{${cssIdA}}"], [data-ractive-css~="{${cssIdA}}"] .green` ), `.green selector for ${cssIdA} should exist` );
		done2();

		t.ok( ~cssB.indexOf( `.green[data-ractive-css~="{${cssIdB}}"], [data-ractive-css~="{${cssIdB}}"] .green` ), `.green selector for ${cssIdB} should exist` );
		done3();

		instanceA.teardown();
		instanceB.teardown();
		envs[ 0 ].env.remove();
		envs[ 1 ].env.remove();

	} );

} );
