import { initModule } from '../../helpers/test-config';
import { test } from 'qunit';

export default function() {
	initModule( 'methods/shift.js' );

	[ true, false ].forEach( modifyArrays => {
		test( `ractive.shift() (modifyArrays: ${modifyArrays})`, t => {
			t.expect( 2 );

			const done = t.async();

			const items = [ 'alice', 'bob', 'charles' ];

			const ractive = new Ractive({
				el: fixture,
				template: `
				<ul>
				{{#items}}
				<li>{{.}}</li>
				{{/items}}
				</ul>`,
				data: { items }
			});

			ractive.shift( 'items' ).then( v => {
				t.strictEqual( v, 'alice' );
				done();
			});

			t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>charles</li></ul>' );
		});
	});

	test( 'shifting an empty array', t => {
		t.expect( 0 );

		const ractive = new Ractive({
			template: '{{#items}}x{{/}}',
			el: 'main',
			data: {
				items: []
			}
		});

		ractive.shift( 'items' );
	});
}
