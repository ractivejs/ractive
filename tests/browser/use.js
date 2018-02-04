import { initModule } from '../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'use.js' );

	test( `Ractive.use gets access to appropriate args`, t => {
		Ractive.use(({ Ractive, proto, instance }) => {
			t.ok( Ractive === Ractive );
			t.ok( proto === Ractive.defaults );
			t.ok( instance === Ractive );
		});
	});

	test( `ractive.use gets access to appropriate args`, t => {
		const r = new Ractive();
		r.use(({ Ractive, proto, instance }) => {
			t.ok( Ractive === Ractive );
			t.ok( proto === r );
			t.ok( instance === r );
		});
	});

	test( `Component.use gets access to appropriate args`, t => {
		const cmp = Ractive.extend({
			decorators: { tmp() {} }
		});

		cmp.use(({ Ractive, proto, instance }) => {
			t.ok( Ractive === Ractive );
			t.ok( proto === cmp.prototype );
			t.ok( instance === cmp );
			t.ok( 'tmp' in instance.decorators );
			proto.foo = 42;
		});

		const r = new cmp();
		r.use(({ Ractive, proto, instance }) => {
			t.ok( Ractive === Ractive );
			t.ok( proto === r );
			t.ok( instance === r );
			t.ok( 'tmp' in instance.decorators );
			t.equal( r.foo, 42 );
			proto.foo = 99;
			t.equal( cmp.prototype.foo, 42 );
		});
	});
}
