import { test } from 'qunit';

[ true, false ].forEach( modifyArrays => {
	test( `ractive.shift() (modifyArrays: ${modifyArrays})`, t => {
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

		ractive.shift( 'items' ).then( v => {
			t.strictEqual( v, 'alice' );
			done();
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>charles</li></ul>' );
	});
});
