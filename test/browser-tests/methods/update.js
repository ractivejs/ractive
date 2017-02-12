import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/update.js' );

	test( 'resolves any unresolved references from parent contexts (#2141)', t => {
		const foo = {};
		const r = new Ractive({
			el: fixture,
			template: `{{#foo}}{{#bar.baz}}{{#bat}}yep{{/}}{{/}}{{/}}`,
			data: { foo }
		});

		foo.bar = { baz: { bat: true } };
		r.update( 'foo.bar.baz.bat' );

		t.htmlEqual( fixture.innerHTML, 'yep' );
	});

	test( 'mappings are also marked along with the rest of the model (#2574)', t => {
		const cmp = Ractive.extend({
			template: '{{foo.bar}}'
		});

		const data = { bar: { bar: 'yep' } };
		const r = new Ractive({
			el: fixture,
			template: '<cmp foo="{{bar}}" />',
			data,
			components: { cmp }
		});

		t.htmlEqual( fixture.innerHTML, 'yep' );
		data.bar.bar = 'still yep';
		r.findComponent().update();
		t.htmlEqual( fixture.innerHTML, 'still yep' );
	});

	test( `an update can be forced on a keypath by passing force: true (#1671)`, t => {
		let msg = 'one';
		const r = new Ractive({
			target: fixture,
			template: '{{fn()}} {{#with foo}}{{fn()}}{{/with}}',
			data: {
				fn () { return msg; },
				foo: {}
			}
		});

		t.htmlEqual( fixture.innerHTML, 'one one' );

		msg = 'two';
		r.update( 'fn', { force: true } );

		t.htmlEqual( fixture.innerHTML, 'two two' );
	});
}
