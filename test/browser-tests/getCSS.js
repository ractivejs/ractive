import { test } from 'qunit';
import { initModule } from './test-config';

export default function() {
	initModule('getCss.js');

	function createIsolatedEnv () {

		return new Ractive.Promise((resolve, reject) => {

			const frame = document.createElement('iframe');

			// need to use onload in FF; http://stackoverflow.com/questions/9967478/iframe-content-disappears-on-firefox
			frame.onload = () => {
				frame.style.width = '0';
				frame.style.height = '0';

				const win = frame.contentWindow || frame;
				const doc = frame.contentDocument || frame.contentWindow.document;

				const script = document.createElement('script');
				doc.body.appendChild(script);

				script.onload = () => {
					resolve({
						Ractive: win.Ractive,
						env: frame,
						body: doc.body
					});
				};
				script.onerror = () => {
					reject();
				};

				script.src = '../ractive.js';
			};

			document.body.appendChild(frame);
		});

	}

	function createComponentDefinition (Ractive) {

		return Ractive.extend({
			css: `
				.green {
					color: green
				}
			`
		});

	}

	test('getCSS with a single component definition', t => {

		const Component = createComponentDefinition(Ractive);

		const cssId = Component.prototype.cssId;
		const css = Ractive.getCSS();

		t.ok(!!~css.indexOf(`.green[data-ractive-css~="{${cssId}}"], [data-ractive-css~="{${cssId}}"] .green`, `.green selector for ${cssId} should exist`));

	});

	test('getCSS with multiple components definition', t => {

		const ComponentA = createComponentDefinition(Ractive);

		const ComponentB = createComponentDefinition(Ractive);

		const cssIdA = ComponentA.prototype.cssId;
		const cssIdB = ComponentB.prototype.cssId;
		const css = Ractive.getCSS();

		// Look for the selectors
		t.ok(!!~css.indexOf(`.green[data-ractive-css~="{${cssIdA}}"], [data-ractive-css~="{${cssIdA}}"] .green`), `.green selector for ${cssIdA} should exist`);
		t.ok(!!~css.indexOf(`.green[data-ractive-css~="{${cssIdB}}"], [data-ractive-css~="{${cssIdB}}"] .green`), `.green selector for ${cssIdB} should exist`);

	});

	if (!window.__karma__) {
		test('getCSS with component definitions constructed from Ractive of different environments', t => {
			t.expect(5);

			const done1 = t.async();
			const done2 = t.async();
			const done3 = t.async();
			const done4 = t.async();
			const done5 = t.async();

			// Simulate two separate Ractive environments using iframes
			Ractive.Promise.all([ createIsolatedEnv(), createIsolatedEnv() ]).then(envs => {

				const ComponentA = createComponentDefinition(envs[ 0 ].Ractive);
				const ComponentB = createComponentDefinition(envs[ 1 ].Ractive);

				const cssIdA = ComponentA.prototype.cssId;
				const cssIdB = ComponentB.prototype.cssId;

				const cssA = envs[ 0 ].Ractive.getCSS();
				const cssB = envs[ 1 ].Ractive.getCSS();

				t.notEqual(cssIdA, cssIdB, `Two top-level components from different environments should not have the same ID`);
				done1();

				t.ok(!!~cssA.indexOf(`.green[data-ractive-css~="{${cssIdA}}"], [data-ractive-css~="{${cssIdA}}"] .green`), `.green selector for ${cssIdA} should exist on component definition A`);
				done2();

				t.ok(!~cssA.indexOf(`.green[data-ractive-css~="{${cssIdB}}"], [data-ractive-css~="{${cssIdB}}"] .green`), `.green selector for ${cssIdB} should NEVER exist on component definition A`);
				done3();

				t.ok(!!~cssB.indexOf(`.green[data-ractive-css~="{${cssIdB}}"], [data-ractive-css~="{${cssIdB}}"] .green`), `.green selector for ${cssIdB} should exist on component definition B`);
				done4();

				t.ok(!~cssB.indexOf(`.green[data-ractive-css~="{${cssIdA}}"], [data-ractive-css~="{${cssIdA}}"] .green`), `.green selector for ${cssIdA} should NEVER exist on component definition B`);
				done5();

				envs[ 0 ].env.remove();
				envs[ 1 ].env.remove();

			});

		});
	}
}
