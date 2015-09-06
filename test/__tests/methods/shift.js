[ true, false ].forEach( modifyArrays => {
	asyncTest( `ractive.shift() (modifyArrays: ${modifyArrays})`, t => {
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

		ractive.shift( 'items' ).then( v => {
			t.strictEqual( v, 'alice' );
			QUnit.start();
		});

		t.htmlEqual( fixture.innerHTML, '<ul><li>bob</li><li>charles</li></ul>' );
	});
});
