[ true, false ].forEach( modifyArrays => {
	test( `ractive.push() (modifyArrays: ${modifyArrays})`, t => {
		let items = [ 'alice', 'bob', 'charles' ];

		const ractive = new Ractive({
			el: fixture,
			template: `
				<ul>
					{{#items}}
						<li>{{this}}</li>
					{{/items}}
				</ul>`,
			data: { items }
		});

		ractive.push( 'items', 'dave' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
	});
});

asyncTest( 'Array method proxies return a promise that resolves on transition complete', t => {
	let items = [ 'alice', 'bob', 'charles' ];

	const ractive = new Ractive({
		el: fixture,
		template: `
			<ul>
				{{#items}}
					<li intro='test'>{{this}}</li>
				{{/items}}
			</ul>`,
		data: { items },
		transitions: {
			test ( t ) {
				setTimeout( t.complete, 50 );
			}
		}
	});

	expect( 1 );

	ractive.push( 'items', 'dave' ).then( () => {
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
		QUnit.start();
	});
});
