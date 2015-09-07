import { test } from 'qunit';

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

test( 'Array method proxies return a promise that resolves on transition complete', t => {
	t.expect( 1 );

	const done = t.async();

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

	ractive.push( 'items', 'dave' ).then( () => {
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>bob</li><li>charles</li><li>dave</li></ul>' );
		done();
	});
});

test( 'Interpolators that directly reference arrays are updated on array mutation (#1074)', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '{{letters}}',
		data: {
			letters: [ 'a', 'b', 'c' ]
		}
	});

	ractive.push( 'letters', 'd', 'e', 'f' );
	t.htmlEqual( fixture.innerHTML, 'a,b,c,d,e,f' );
});
