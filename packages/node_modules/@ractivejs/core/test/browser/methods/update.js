import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

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

	test( `update with no keypath can still take options (#2948)`, t => {
		const obj = { foo: 'a' };
		const r = new Ractive({
			target: fixture,
			template: '{{obj.foo}}',
			data: { obj }
		});

		t.equal( fixture.innerHTML, 'a' );

		obj.foo = 'b';
		r.update({ force: true });

		t.equal( fixture.innerHTML, 'b' );
	});

	test( `force update works on downstream keypaths`, t => {
		const obj = { foo() {} };
		obj.foo.bar = function bar () {};
		obj.foo.bar.baz = 'a';

		const r = new Ractive({
			target: fixture,
			template: '{{obj.foo.bar.baz}}',
			data: { obj }
		});

		t.equal( fixture.innerHTML, 'a' );

		obj.foo.bar.baz = 'b';
		r.update( 'obj', { force: true } );

		t.equal( fixture.innerHTML, 'b' );
	});
}
