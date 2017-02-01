import { initModule } from '../../helpers/test-config';

export default function() {
	initModule( 'methods/reverse.js' );

	[ true, false ].forEach( modifyArrays => {
		QUnit.test( `ractive.reverse() (modifyArrays: ${modifyArrays})`, t => {
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

			ractive.reverse( 'items' );
			t.htmlEqual( fixture.innerHTML, '<ul><li>charles</li><li>bob</li><li>alice</li></ul>' );
		});
	});
}
