import { test } from 'qunit';
import { initModule } from '../test-config';

export default function() {
	initModule( 'methods/reverse.js' );

	[ true, false ].forEach( modifyArrays => {
		test( `ractive.reverse() (modifyArrays: ${modifyArrays})`, t => {
			let items = [ 'alice', 'bob', 'charles' ];

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

			ractive.reverse( 'items' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>charles</li><li>bob</li><li>alice</li></ul>' );
		});
	});
}
