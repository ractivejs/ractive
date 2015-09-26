import { test } from 'qunit';

[ true, false ].forEach( modifyArrays => {
	test( `ractive.splice() (modifyArrays: ${modifyArrays})`, t => {
		t.expect( 5 );

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

		ractive.splice( 'items', 1, 1, 'dave', 'eric' ).then( v => {
			t.deepEqual( v, [ 'bob' ] );
			done();
		});
		t.htmlEqual( fixture.innerHTML, '<ul><li>alice</li><li>dave</li><li>eric</li><li>charles</li></ul>' );

		// removing before the beginning removes from the beginning
		ractive.splice( 'items', -10, 1, 'john' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>john</li><li>dave</li><li>eric</li><li>charles</li></ul>' );

		// removing beyond the end is a noop
		ractive.splice( 'items', 10, 1, 'larry' );
		t.htmlEqual( fixture.innerHTML, '<ul><li>john</li><li>dave</li><li>eric</li><li>charles</li><li>larry</li></ul>' );

		// negative indexing within bounds starts from the end
		ractive.splice( 'items', -1, 1 );
		t.htmlEqual( fixture.innerHTML, '<ul><li>john</li><li>dave</li><li>eric</li><li>charles</li></ul>' );
	});
});

test( 'Unbound sections disregard splice instructions (#967)', t => {
	const ractive = new Ractive({
		el: fixture,
		template: `
			<ul>
				{{#list:i}}
					<li>{{.}}: {{#list}}{{.}}{{/}}</li>
				{{/list}}
			</ul>`,
		data: {
			list: [ 'a', 'b', 'c' ]
		}
	});

	ractive.splice( 'list', 1, 1 );
	t.htmlEqual( fixture.innerHTML, '<ul><li>a: ac</li><li>c: ac</li></ul>' );
});

test( 'splice with net additions should make all indices greater than start update', t => {
	const ractive = new Ractive({
		el: fixture,
		template: '{{foo.2}}',
		data: { foo: [ 0, 2 ] }
	});

	ractive.splice( 'foo', 1, 0, 1 );
	t.htmlEqual( fixture.innerHTML, '2' );
	ractive.splice( 'foo', 0, 1, 0, 'hello' );
	t.htmlEqual( fixture.innerHTML, '1' );
});

test( 'splice with one argument (#1943)', t => {
	let ractive = new Ractive({
		el: fixture,
		template: '{{#items}}{{this}}{{/}}',
		data: {
			items: [ 1, 2, 3 ]
		}
	});

	ractive.splice( 'items', 1 );

	t.htmlEqual( fixture.innerHTML, '1' );
});

test( 'splice on array removes correct elements (#2065)', t => {
	const Item = Ractive.extend({
		template: '{{value}}'
	});

	let ractive = new Ractive({
		el: fixture,
		template: '{{#items}}<Item />{{/}}',
		components: { Item },
	});

	const items = [ { value: 1 }, { value: 2 }, { value: 3 } ];

	ractive.set('items', items.slice( 0 ) );
	ractive.splice( 'items', 0, 1 );
	t.deepEqual( ractive.get( 'items' ), [ { value: 2 }, { value: 3 } ] )
	t.htmlEqual( fixture.innerHTML, '23' );

	ractive.set('items', items.slice( 0 ) );
	ractive.splice( 'items', 1, 1 );
	t.deepEqual( ractive.get( 'items' ), [ { value: 1 }, { value: 3 } ] )
	t.htmlEqual( fixture.innerHTML, '13' );

	ractive.set('items', items.slice( 0 ) );
	ractive.splice( 'items', 2, 1 );
	t.deepEqual( ractive.get( 'items' ), [ { value: 1 }, { value: 2 } ] )
	t.htmlEqual( fixture.innerHTML, '12' );
});
