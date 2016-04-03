import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/get.js' );

	test( 'Returns mappings on root .get()', t => {
		const ractive = new Ractive({
			el: fixture,
			template: `<Widget bar='{{foo}}' qux='{{qux}}'/>`,
			data: {
				foo: 'foo',
				qux: 'qux'
			},
			components: {
				Widget: Ractive.extend({
					template: '{{JSON.stringify(.)}}',
					data: {
						foo: 'mine'
					}
				})
			}
		});

		const expected = { foo: 'mine', bar: 'foo', qux: 'qux' };
		t.deepEqual( ractive.findComponent( 'Widget' ).get(), expected );
		t.deepEqual( fixture.innerHTML, JSON.stringify( expected ) );
	});
}
