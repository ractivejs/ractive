import { test } from 'qunit';

[ true, false ].forEach( modifyArrays => {
	test( `ractive.pop() (modifyArrays: ${modifyArrays})`, t => {
		t.expect( 2 );

		const done = t.async();

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

		ractive.pop( 'items' ).then( v => {
			t.strictEqual( v, 'charles' );
			done();
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li></ul>' );
	});
});
