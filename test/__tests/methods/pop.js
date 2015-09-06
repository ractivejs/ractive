import { test } from 'qunit';

[ true, false ].forEach( modifyArrays => {
	asyncTest( `ractive.pop() (modifyArrays: ${modifyArrays})`, t => {
		let items = [ 'alice', 'bob', 'charles' ];
		expect( 2 );

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
			QUnit.start();
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li></ul>' );
	});
});
