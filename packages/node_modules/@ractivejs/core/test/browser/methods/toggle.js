import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/toggle.js' );

	test( 'ractive.toggle("foo") toggles the value of foo', t => {
		const ractive = new Ractive({
			data: { foo: false }
		});

		ractive.toggle( 'foo' );
		t.ok( ractive.get( 'foo' ) );

		ractive.toggle( 'foo' );
		t.ok( !ractive.get( 'foo' ) );
	});

	test( 'non-boolean values are effectively coerced', t => {
		const ractive = new Ractive({
			data: {
				foo: null,
				bar: 0,
				baz: 'str'
			}
		});

		ractive.toggle( 'foo' );
		ractive.toggle( 'bar' );
		ractive.toggle( 'baz' );
		ractive.toggle( 'qux' );

		t.ok(  ractive.get( 'foo' ) );
		t.ok(  ractive.get( 'bar' ) );
		t.ok( !ractive.get( 'baz' ) );
		t.ok(  ractive.get( 'qux' ) );
	});

	test( 'each keypath that matches a wildcard is toggled individually (#1604)', t => {
		const items = [
			{ active: true },
			{ active: false },
			{ active: true }
		];

		const ractive = new Ractive({
			data: { items }
		});

		ractive.toggle( 'items[*].active' );

		t.ok( !ractive.get( 'items[0].active' ) );
		t.ok(  ractive.get( 'items[1].active' ) );
		t.ok( !ractive.get( 'items[2].active' ) );
	});
}
