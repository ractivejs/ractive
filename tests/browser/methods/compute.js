import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/compute.js' );

	test( `computations can be added on the fly using compute`, t => {
		const r = new Ractive({
			target: fixture,
			template: '{{comp}}',
			data: { foo: 'bar' }
		});

		t.htmlEqual( fixture.innerHTML, '' );

		r.compute( 'comp', () => r.get( 'foo' ) );

		t.htmlEqual( fixture.innerHTML, 'bar' );

		r.set( 'foo', 'baz' );

		t.htmlEqual( fixture.innerHTML, 'baz' );
	});
}
