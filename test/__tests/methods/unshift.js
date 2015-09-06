import { test } from 'qunit';

[ true, false ].forEach( modifyArrays => {
	test( `ractive.unshift() (modifyArrays: ${modifyArrays})`, t => {
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

		ractive.unshift( 'items', 'dave');
		t.htmlEqual( fixture.innerHTML, '<ul><li>dave</li><li>alice</li><li>bob</li><li>charles</li></ul>' );
	});
});
